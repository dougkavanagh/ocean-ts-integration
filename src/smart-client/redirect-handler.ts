import { NextFunction, Request, RequestHandler, Response } from "express";
import { Client, custom, Issuer, TokenSet } from "openid-client";
import {
  ClientLaunchState,
  ErrorMessage,
  getRedirectUrl,
  isErrorMessage,
} from "./smart-util";
import { lookupIssuerInAllowlist } from "./allowed-issuers";
import logger from "./logger";
import { verifyJwt } from "./session-service";
import { CLIENT_ID, CLIENT_SECRET } from "./env";

custom.setHttpOptionsDefaults({
  timeout: 60000,
});

// https://www.npmjs.com/package/openid-client

const handler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  logger.info(`SMART client redirect`);
  try {
    if (req.query.error) {
      return next(
        `Error returned from SMART server as part of the redirect: ${req.query.error}`
      );
    }

    if (!req.query.state) {
      return next(`Missing state parameter from SMART redirect`);
    }
    logger.info(`SMART client: verifying JWT`);
    const state = verifyJwt(req.query.state.toString()) as
      | ClientLaunchState
      | ErrorMessage;
    if (isErrorMessage(state)) {
      return next(`Bad state token`);
    }

    const issuerUrl = state.issuerUrl;
    if (!issuerUrl) {
      return next(
        `Issuer value was not available in the SMART client redirect; it should have been stored in the state from the initial launch`
      );
    }
    const issuerConfig = lookupIssuerInAllowlist(issuerUrl);
    if (!issuerConfig) {
      return next(
        `SMART client error: The issuer from SMART server is not in the allowed-issuers.ts allowlist: ${issuerUrl}`
      );
    }
    const tokenSet = await fetchAndValidateTokenWithOIDC(
      issuerUrl,
      req,
      res,
      next
    );
    if (!tokenSet) {
      res.status(401).send("Unauthorized");
      return;
    }
    if (!tokenSet.access_token) {
      return next(`No access token returned from SMART server`);
    }
    await singleSignOnWithIdToken(tokenSet);
    checkForOceanSharedEncryptionKey(tokenSet);
    const patientId = checkForPatientContext(tokenSet);
    if (patientId) {
      await fetchFhirResources({
        issuerUrl,
        accessToken: tokenSet.access_token,
        patientId,
      });
    }
    res.json({
      body: "SMART launch is complete",
      status: 200,
    });
  } catch (e: unknown) {
    logger.error(e);
    next(
      e instanceof Error ? e.message : `Error returned from SMART server: ${e}`
    );
  }
};

async function fetchAndValidateTokenWithOIDC(
  issuerUrl: string,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<TokenSet | void> {
  logger.info(
    `SMART client redirect handler: discovering issuer at ${issuerUrl}`
  );
  logger.info(`creds: ${CLIENT_ID} ${CLIENT_SECRET}`);
  const issuer: Issuer<Client> = await Issuer.discover(issuerUrl);
  const client = new issuer.Client({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET ?? undefined,
    token_endpoint_auth_method: "none",
  });
  //https://github.com/panva/node-openid-client/blob/main/docs/README.md#clientcallbackredirecturi-parameters-checks-extras
  client.grant({
    grant_type: "authorization_code",
    code: req.query.code,
  });
  const params = client.callbackParams(req);
  try {
    // fetch the token with this SMART app's credentials and the authorization code
    logger.info(
      `SMART client redirect handler: fetching token from ${issuer.token_endpoint}`
    );
    const tokenSet = await client.callback(getRedirectUrl(req), params, {
      state: req.query.state?.toString(),
    });
    // this client library automatically validates the token signature and
    // the token expiration among other OIDC checks, prior to returning the tokenSet
    logger.info(`received and validated tokens for ${issuerUrl}`);
    return tokenSet;
  } catch (e: unknown) {
    logger.error("fetching token failed:");
    console.error(e);
    logger.error(e);
    next(`Error returned from SMART server while fetching token: ${e}`);
  }
}

async function singleSignOnWithIdToken(tokenSet: TokenSet) {
  const idTokenClaims = tokenSet.claims();
  // The SMART server should return a 'sub' value that is unique to the user
  // We append the issuer to the sub value to make it unique across SMART servers:
  const smartUserId = idTokenClaims.sub + "@" + idTokenClaims.iss;

  // The smartUserId will be stored privately on the Ocean user account.
  // Ocean will check for an existing Ocean user account with this smartUserId.
  // If one exists, the user will be signed in to that account (which is safe to do thanks to the OIDC validation).
  // Otherwise if there is no existing account found, the user is prompted to sign into Ocean (just this one first time) to link their account.

  logger.info(`SMART user id: ${smartUserId}`);
  return smartUserId;
}

function checkForOceanSharedEncryptionKey(tokenSet: TokenSet) {
  const oceanSharedEncryptionKeyEncoded = (tokenSet.oceanSharedEncryptionKey ??
    tokenSet.claims().oceanSharedEncryptionKey) as string;
  if (!oceanSharedEncryptionKeyEncoded) {
    logger.warn(
      `Warning: The oceanSharedEncryptionKey Base64 value was not found in token or the token claims. It is not mandatory, but it s strongly recommended. Ocean uses it to automatically populate the shared encryption key in the browser for users.`
    );
    return;
  }
  logger.info(
    `The provided value for the Base64-encoded oceanSharedEncryptionKey is: ${oceanSharedEncryptionKeyEncoded}`
  );
  const decodedOceanSharedEncryptionKey = atob(oceanSharedEncryptionKeyEncoded);
  logger.info(
    `The decoded oceanSharedEncryptionKey is: ${decodedOceanSharedEncryptionKey}`
  );
}

function checkForPatientContext(tokenSet: TokenSet): string | null {
  if (tokenSet.patient && typeof tokenSet.patient === "string") {
    return tokenSet.patient as string;
  } else {
    logger.info(
      "No 'patient' ID string was found in the token; this is acceptable only if it is a launch WITHOUT patient context."
    );
    return null;
  }
}

async function fetchFhirResources({
  issuerUrl,
  accessToken,
  patientId,
}: {
  issuerUrl: string;
  accessToken: string;
  patientId: string;
}) {
  logger.info(`Fetching FHIR resources from ${issuerUrl}`);
  await readFhirResource({
    url: `${issuerUrl}/Patient/${patientId}`,
    accessToken,
    expectedResourceType: "Patient",
  });

  await readFhirResource({
    url: `${issuerUrl}/Patient/${patientId}/$everything`,
    accessToken,
    expectedResourceType: "Bundle",
  });
}

async function readFhirResource({
  url,
  accessToken,
  expectedResourceType,
}: {
  url: string;
  accessToken: string;
  expectedResourceType?: string;
}): Promise<object> {
  try {
    logger.info(`Fetching from ${url}:`);
    const resource = (await (
      await fetch(url, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      })
    ).json()) as any;
    if (resource.resourceType !== expectedResourceType) {
      throw new Error(`FHIR resource ${url} is not a ${expectedResourceType}`);
    }
    logger.info(JSON.stringify(resource));
    return resource;
  } catch (error) {
    logger.error(error);
    throw new Error(
      "Error when fetching FHIR resource from " + url + ": " + error
    );
  }
}

export default handler;
