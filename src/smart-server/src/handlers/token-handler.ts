import crypto from "crypto";
import { Request, Response } from "express";
import { JwtPayload, sign } from "jsonwebtoken";
import { SessionUser, signObject } from "../auth-utils";
import { FHIR_SERVER_URL, SERVER_URL, OIDC_PRIVATE_KEY } from "../env";
import logger from "../logger";
import { AuthorizationCode } from "./authorize-handler";
import { AuthorizationCodeService } from "../authorization-code-service";
import base64url from "base64-url";

export async function handleTokenRequest(req: Request, res: Response) {
  const { client_id, client_secret, grant_type, code, code_verifier, scope } =
    req.body;
  logger.info("Handling token request");
  const contentType = req.header("content-type");
  if (
    !contentType?.includes("application/x-www-form-urlencoded") &&
    !contentType?.includes("application/json") &&
    !contentType?.includes("application/fhir+json")
  ) {
    return res
      .status(400)
      .send(
        "Content-Type must be application/x-www-form-urlencoded or application/json"
      );
  }
  try {
    if (grant_type === "authorization_code") {
      handleAuthorizationCode({
        req,
        res,
        client_id,
        client_secret,
        code,
        code_verifier,
      });
    } else {
      return res.status(401).send("grant_type must be authorization_code");
    }
  } catch (error) {
    return res.status(500).send(error);
  }
}

async function handleAuthorizationCode(args: {
  req: Request;
  res: Response;
  client_id: string;
  client_secret?: string;
  code: string;
  code_verifier?: string;
}) {
  const { req, res, client_id, client_secret, code, code_verifier } = args;
  if (!code) {
    return res.status(401).send("Missing authorization code");
  }
  const providedAuthCode = JSON.parse(
    base64url.decode(code)
  ) as AuthorizationCode;
  logger.info("Provided auth code: " + JSON.stringify(providedAuthCode));
  const storedAuthCode = await AuthorizationCodeService.findAndRemoveById(
    providedAuthCode.id
  );
  logger.info("Got auth code " + storedAuthCode?.id + " from db");
  if (!storedAuthCode) {
    return res.status(401).send("Invalid authorization code");
  }
  if (storedAuthCode.expiresAt < new Date()) {
    return res.status(401).send("Authorization code has expired");
  }
  if (storedAuthCode.codeChallenge) {
    if (!code_verifier) {
      return res.status(401).send("Authorization code_verifier is missing");
    }
    if (code_verifier.length < 43) {
      return res
        .status(400)
        .send(
          "Authorization code_verifier is too short (must be at least 43 characters)"
        );
    }
    const codeChallenge = crypto
      .createHash("sha256")
      .update(code_verifier ?? "")
      .digest("base64");
    if (
      codeChallenge !==
      Buffer.from(storedAuthCode.codeChallenge, "base64").toString("base64")
    ) {
      return res.status(401).send("Authorization code challenge failed");
    }
  }
  // recommended client validation:
  // else if (client_secret) {
  //   if (!validateClientCredentials(client_id, client_secret)) {
  //     return res.status(401).send("Invalid client credentials");
  //   }
  // } else {
  //   return res
  //     .status(401)
  //     .send(
  //       "In addition to the authorization code, a code_verifier (PKCE) and/or client_secret are required to ensure this client is trustworthy"
  //     );
  // }
  const user = {
    siteId: storedAuthCode.siteId,
    accessibleSiteIds: storedAuthCode.siteId ? [storedAuthCode.siteId] : [],
    roles: {
      admin: false,
    },
    profile: {
      displayName: `OAuth2 authorization_code user`,
    },
  };
  logger.info("Responding with access token");
  sendAccessToken({
    req,
    res,
    patient: storedAuthCode.ptId,
    encounter: storedAuthCode.encounter,
    idTokenIssuer: storedAuthCode.idTokenIssuer ?? "",
    clientId: client_id,
    user,
    scopes: storedAuthCode.scopes,
    extraContext: await getExtraContext(storedAuthCode),
  });
}

function validateClientCredentials(
  client_id: string,
  client_secret: string
): boolean {
  // check against your EMR's allowlist
  return client_id === "my-client-id" && client_secret === "my-client-secret";
}

function sendAccessToken({
  req,
  res,
  clientId,
  idTokenIssuer,
  user,
  scopes,
  patient,
  encounter,
  extraContext,
}: {
  req: Request;
  res: Response;
  clientId: string;
  idTokenIssuer: string;
  user: SessionUser;
  scopes: string[];
  patient?: string;
  encounter?: string;
  extraContext?: {
    [key: string]: string;
  };
}) {
  const expiresIn = 60 * 60;
  const accessTokenPayload: JwtPayload = {
    iss: SERVER_URL + req.baseUrl,
    aud: FHIR_SERVER_URL,
    sub: clientId,
    exp: Math.floor(Date.now() / 1000) + expiresIn,
    iat: Math.floor(Date.now() / 1000),
    user,
  };
  const token = signObject(accessTokenPayload, {});
  const idToken =
    user &&
    (scopes.includes("openid") ||
      scopes.includes("profile") ||
      scopes.includes("fhirUser"))
      ? createIdToken({
          iss: idTokenIssuer,
          user: {
            id: user.userId ?? "",
            name: user.profile.displayName,
          },
          clientId,
        })
      : undefined;
  res.status(200);
  logger.info("Responding with access token");
  res.json({
    ...extraContext,
    access_token: token,
    refresh_token: token,
    id_token: idToken,
    token_type: "Bearer",
    expires_in: expiresIn,
    scope: scopes.join(" "),
    patient,
    encounter,
  });
}

interface Payload {
  profile: string;
  fhirUser: string;
  aud: string;
  sub: string;
  iss: string;
  nonce?: string;
}
interface FhirUser {
  id: string;
  name: string;
}
function createIdToken({
  user,
  iss,
  clientId,
  nonce,
}: {
  user: FhirUser;
  iss: string;
  clientId: string;
  nonce?: string;
}) {
  // e.g. https://build.fhir.org/ig/HL7/smart-app-launch/worked_example_id_token.html
  // "fhirUser": "https://my-ehr.org/fhir/Practitioner/123"
  const userString = FHIR_SERVER_URL + "/Practitioner/" + user.id;
  const payload: Payload = {
    iss: iss,
    profile: userString,
    fhirUser: userString,
    aud: clientId,
    sub: crypto.createHash("sha256").update(userString).digest("hex"),
  };
  if (nonce) {
    payload.nonce = nonce;
  }
  return sign(payload, OIDC_PRIVATE_KEY, {
    algorithm: "RS256",
    expiresIn: `${60} minutes`,
  });
}

async function getExtraContext(
  code: AuthorizationCode
): Promise<{ [key: string]: string } | undefined> {
  // here you could fetch additional data based on the code.siteId, such as the oceanSharedEncryptionKey
  return {
    oceanSharedEncryptionKey: Buffer.from("sampleSharedEncryptionKey").toString(
      "base64"
    ),
  };
}
