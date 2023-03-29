import { config } from "dotenv";
const parsed = config().parsed;

export const PORT = parsed?.PORT ?? "8888";
export const HOST = parsed?.HOST ?? "http://localhost:"+PORT;

export const SESSION_SECRET =
  process.env.SESSION_SECRET ?? "";
if (!SESSION_SECRET) {
  console.error("No session secret. Set SESSION_SECRET environment variable.");
}

export const OIDC_PRIVATE_KEY = 
  process.env.OIDC_PRIVATE_KEY ?? process.env.OIDC_PRIVATE_KEY ?? "";
if (!SESSION_SECRET) {
  console.error("Set OIDC_PRIVATE_KEY environment variable.");
}

export const FHIR_URL = HOST + "/fhir";
export const AUTHORIZE_URL = HOST + "/authorize";
export const KEYS_URL = HOST + "/keys";
export const TOKEN_URL = HOST + "/token";

export const SMART_CLIENT_URL = process.env.SMART_CLIENT_URL ?? process.env.SMART_CLIENT_URL ?? 
  `${HOST}/smart-client/launch`;