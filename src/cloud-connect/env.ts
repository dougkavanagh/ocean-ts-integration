import { config } from "dotenv";
const parsed = config().parsed;

export const CC_FHIR_API_URL = parsed?.CC_FHIR_API_URL ?? "";
export const CC_CLIENT_ID = parsed?.CC_CLIENT_ID ?? "";
export const CC_CLIENT_SECRET = parsed?.CC_CLIENT_SECRET ?? "";
export const CC_OAUTH2_TOKEN_URL = parsed?.CC_OAUTH2_TOKEN_URL ?? "";
export const CC_SCOPES = parsed?.CC_SCOPES ?? "";
