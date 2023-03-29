import crypto from "crypto";
import { Request, Response } from "express";
import { JwtPayload, sign } from "jsonwebtoken";
import { SessionUser, signObject } from "../auth-utils";
import { FHIR_URL, HOST } from '../env';

export async function handleTokenRequest(req: Request, res: Response) {
  const { client_id, client_secret, grant_type, code, code_verifier, scope } =
    req.body;
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
    if (grant_type === "client_credentials") {
      handleClientCredentials({ req, res, client_id, client_secret, scope });
    } else {
      return res
        .status(401)
        .send("grant_type must be client_credentials");
    }
  } catch (error) {
    return res.status(500).send(error);
  }
}

async function handleClientCredentials(args: {
  req: Request;
  res: Response;
  client_id: string;
  client_secret: string;
  scope: string;
}) {
  const { req, res, client_id, client_secret, scope } = args;
  if (!client_id || !client_secret) {
    return res.status(401).send("Missing client_id and client_secret headers");
  }
  const creds = await validateCredentials(client_id, client_secret);
  if (!creds) {
    return res.status(401).send("Invalid client_id or client_secret");
  }
  const user = {
    siteId: creds.siteId,
    accessibleSiteIds: [creds.siteId],
    clientId: creds.clientId,
    roles: {
      admin: false,
    },
    profile: {
      displayName: `OAuth2 client_credentials user ${creds.clientId}`,
    },
  };
  const scopes = (scope ?? "").split(" ");
  sendAccessToken({
    req,
    res,
    clientId: client_id,
    idTokenIssuer: creds.idTokenIssuer ?? "",
    user,
    scopes,
  });
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
    iss: HOST + req.baseUrl,
    aud: FHIR_URL,
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
  const userString = FHIR_URL + "/Practitioner/" + user.id;
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

async function validateCredentials(client_id: string, client_secret: string) {
  return {
    siteId: "testSite",
    clientId: client_id,
    idTokenIssuer: "https://test.com",
  }
}

