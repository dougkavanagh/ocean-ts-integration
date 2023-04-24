import { Request, Response } from "express";
import { pem2jwk } from "pem-jwk";
import { OIDC_KID, OIDC_PRIVATE_KEY } from "../env";

if (!OIDC_PRIVATE_KEY) {
  throw new Error("Missing OIDC_PRIVATE_KEY environment variable.");
}
const JWK = pem2jwk(OIDC_PRIVATE_KEY);
const publicJwk = {
  alg: "RS256",
  kid: OIDC_KID,
  use: "sig",
  e: JWK.e,
  n: JWK.n,
  kty: JWK.kty,
};

export async function handleKeysRequest(req: Request, res: Response) {
  res.json({
    keys: [publicJwk],
  });
}
