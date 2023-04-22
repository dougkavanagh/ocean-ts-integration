import { Request, Response } from "express";
import { URL } from "url";
import base64url from "base64-url";
import { ErrorMessage, isErrorMessage } from "../core";
import { verifyJwt } from "../auth-utils";
import { LaunchToken } from "../launch-token";
import { AuthorizationCodeService } from "../authorization-code-service";

function stringIsAValidUrl(s: string) {
  try {
    new URL(s);
    return true;
  } catch (err) {
    return false;
  }
}

export async function handleAuthorizeRequest(req: Request, res: Response) {
  const {
    response_type,
    client_id,
    client_secret,
    redirect_uri,
    scope,
    state,
    code_challenge,
    code_challenge_method,
    launch, // SMART launch context
  } = req.method === "POST" ? req.body : req.query;
  const contentType = req.header("content-type");
  if (
    req.method === "POST" &&
    !contentType?.includes("application/x-www-form-urlencoded")
  ) {
    return res
      .status(400)
      .send(
        `Content-Type must be application/x-www-form-urlencoded; was ${contentType}`
      );
  }
  if (response_type !== "code") {
    return res.status(401).send("response_type must be 'code'");
  }
  if (!scope?.trim()) {
    return res.status(401).send("scope must be populated");
  }
  const scopes = scope.split(" ");
  if (!client_id) {
    return res.status(401).send("Missing client_id header");
  }
  if (!client_secret) {
    return res.status(401).send("Missing client_secret header");
  }
  if (!stringIsAValidUrl(redirect_uri)) {
    return res.status(401).send("redirect_uri must be a valid URL");
  }
  if (!code_challenge) {
    return res.status(401).send("code_challenge must be specified");
  }
  if (code_challenge_method !== "S256") {
    return res.status(401).send("code_challenge_method must be 'S256'");
  }
  if (!validateClientCredentials(client_id, client_secret)) {
    return res.status(401).send("Invalid client credentials");
  }
  try {
    const code = await createAuthorizationCodeBasedOnSuppliedCreds(launch);
    if (isErrorMessage(code)) {
      return res
        .status(400)
        .send("Unable to create authorization code based on site credentials");
    } else {
      redirect({ res, code, redirect_uri, state });
    }
  } catch (e: any) {
    return res.status(500).send(e.message);
  }
}

async function createAuthorizationCodeBasedOnSuppliedCreds(
  launch: string
): Promise<AuthorizationCode | ErrorMessage> {
  if (launch) {
    return createAuthorizationCodeFromLaunchToken(launch);
  } else {
    return new ErrorMessage(
      "Only 'launch' authorization is supported by the OAuth2/OIDC in SMART app launch"
    );
  }
}

async function createAuthorizationCodeFromLaunchToken(
  launch: string
): Promise<AuthorizationCode | ErrorMessage> {
  const launchToken = verifyJwt(launch) as LaunchToken | ErrorMessage;
  if (isErrorMessage(launchToken)) {
    return new ErrorMessage("Invalid launch token");
  }
  const code: AuthorizationCode =
    await AuthorizationCodeService.createFromLaunchToken(launchToken);
  // Note: the authorization code is generally saved to the database or stored in e.g. Redis
  return code
    ? code
    : new ErrorMessage(
        "Unable to create authorization code based on session context"
      );
}

function redirect({
  res,
  code,
  state,
  redirect_uri,
}: {
  res: Response;
  code: AuthorizationCode;
  state: string;
  redirect_uri: string;
}) {
  res.redirect(
    redirect_uri +
      `?code=${base64url.encode(JSON.stringify(code))}&state=${state}`
  );
}

export interface AuthorizationCode {
  id: string;
  userId?: string;
  clientId: string;
  siteId: string;
  ptId?: string;
  encounter?: string;
  idTokenIssuer?: string;
  scopes: string[];
  codeChallenge?: string | null;
  codeChallengeMethod?: string | null;
  expiresAt: Date;
}

function validateClientCredentials(
  client_id: string,
  client_secret: string
): boolean {
  // check against your EMR's allowlist
  return client_id === "my-client-id" && client_secret === "my-client-secret";
}
