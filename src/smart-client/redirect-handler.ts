import { NextFunction, Request, RequestHandler, Response } from "express";
import { Client, custom, Issuer, TokenSet } from "openid-client";
import { ClientLaunchState, ErrorMessage, isErrorMessage } from "./smart-util";
import { CLIENT_ID, lookupIssuerInAllowlist, redirectUrl } from "./config";
import logger from "./logger";
import { verifyJwt } from "./session-service";
import { CLIENT_SECRET } from "./env";

custom.setHttpOptionsDefaults({
  timeout: 60000,
});

// https://www.npmjs.com/package/openid-client

const handler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.query.error) {
      return next(
        `Error returned from SMART server as part of the redirect: ${req.query.error}`
      );
    }
    if (!req.query.state) {
      return next(`Missing state parameter from SMART redirect`);
    }
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
        `Issuer from SMART server is not in the config.ts allowlist: ${issuerUrl}`
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
    await fetchFhirResources(issuerUrl, tokenSet.access_token);
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
    const tokenSet = await client.callback(redirectUrl, params, {
      state: req.query.state?.toString(),
    });
    // this client library automatically validates the token signature and
    // the token expiration among other OIDC checks, prior to returning the tokenSet
    logger.info(`received and validated tokens for ${issuerUrl}`);
    return tokenSet;
  } catch (e: unknown) {
    logger.error(`Error returned from SMART server while fetching token: ${e}`);
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

async function fetchFhirResources(issuerUrl: string, accessToken: string) {
  logger.info(`Fetching FHIR resources from ${issuerUrl}`);
  const patient = await readFhirResource(issuerUrl + "/Patient", accessToken);
  logger.info(`Patient.read: ${JSON.stringify(await patient.json())}`);
  const everything = await readFhirResource(
    issuerUrl + "/Patient/$everything",
    accessToken
  );
  logger.info(
    `Patient/$everything: ${JSON.stringify(await everything.json())}`
  );
}

async function readFhirResource(url: string, accessToken: string) {
  return await fetch(url, {
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  });
}

export default handler;
