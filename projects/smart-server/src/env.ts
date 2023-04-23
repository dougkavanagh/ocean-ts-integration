import { config } from "dotenv";
import logger from "./logger";
const envs = config().parsed;

export const PORT = envs?.PORT ?? "8888";
export const FHIR_ENDPOINT_PREFIX = envs?.FHIR_PATH_PREFIX ?? "/fhir";
export const AUTH_ENDPOINT_PREFIX = envs?.AUTH_PATH_PREFIX ?? "/auth";
export const SERVER_URL = envs?.SERVER_URL ?? "http://localhost:" + PORT;

export const ALLOWED_CLIENT_ID = envs?.ALLOWED_CLIENT_ID;
export const ALLOWED_CLIENT_SECRET = envs?.ALLOWED_CLIENT_SECRET;

export const SESSION_SECRET = envs?.SESSION_SECRET ?? "";
if (!SESSION_SECRET) {
  logger.error("No session secret. Set SESSION_SECRET environment variable.");
}

export const OIDC_PRIVATE_KEY = Buffer.from(
  envs?.OIDC_PRIVATE_KEY_BASE64 ?? "",
  "base64"
).toString();
if (!OIDC_PRIVATE_KEY) {
  logger.error("Set OIDC_PRIVATE_KEY_BASE64 environment variable.");
}
export const OIDC_PUBLIC_KEY = Buffer.from(
  envs?.OIDC_PUBLIC_KEY_BASE64 ?? "",
  "base64"
).toString();
if (!OIDC_PUBLIC_KEY) {
  logger.error("Set OIDC_PUBLIC_KEY_BASE64 environment variable.");
}

export const OIDC_KID = envs?.OIDC_KID ?? "";
if (!OIDC_KID) {
  logger.error("Set OIDC_KID environment variable.");
}

export const FHIR_SERVER_URL = SERVER_URL + FHIR_ENDPOINT_PREFIX;
export const AUTHORIZE_URL = SERVER_URL + AUTH_ENDPOINT_PREFIX + "/authorize";
export const TOKEN_URL = SERVER_URL + AUTH_ENDPOINT_PREFIX + "/token";
export const TOKEN_ISSUER_URL = SERVER_URL + AUTH_ENDPOINT_PREFIX;
export const KEYS_URL = SERVER_URL + "/keys";

export const SMART_CLIENT_URL =
  envs?.SMART_CLIENT_URL ?? `http://localhost:9501/launch`;
