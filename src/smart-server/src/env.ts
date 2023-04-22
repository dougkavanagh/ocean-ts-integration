import { config } from "dotenv";
const envs = config().parsed;

export const PORT = envs?.PORT ?? "8888";
export const HOST = envs?.HOST ?? "http://localhost:" + PORT;

export const SESSION_SECRET = envs?.SESSION_SECRET ?? "";
if (!SESSION_SECRET) {
  console.error("No session secret. Set SESSION_SECRET environment variable.");
}

export const OIDC_PRIVATE_KEY = envs?.OIDC_PRIVATE_KEY ?? "";
if (!OIDC_PRIVATE_KEY) {
  console.error("Set OIDC_PRIVATE_KEY environment variable.");
}
export const OIDC_PUBLIC_KEY = envs?.OIDC_PUBLIC_KEY ?? "";
if (!OIDC_PUBLIC_KEY) {
  console.error("Set OIDC_PUBLIC_KEY environment variable.");
}

export const FHIR_URL = HOST + "/fhir";
export const AUTHORIZE_URL = HOST + "/authorize";
export const KEYS_URL = HOST + "/keys";
export const TOKEN_URL = HOST + "/token";

export const SMART_CLIENT_URL =
  envs?.SMART_CLIENT_URL ?? `http://localhost:9501/launch`;
