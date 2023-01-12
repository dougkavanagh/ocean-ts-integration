import { config } from "dotenv";
const parsed = config().parsed;

export const PORT = parsed?.PORT ?? "8888";
export const FHIR_SERVER_URL =
  parsed?.FHIR_SERVER_URL ?? "https://your.smart.server";
export const CLIENT_ID = parsed?.CLIENT_ID ?? "";
export const CLIENT_SECRET = parsed?.CLIENT_SECRET ?? "";
