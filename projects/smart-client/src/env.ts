import { config } from "dotenv";
const parsed = config().parsed;

export const PORT = parsed?.PORT ?? "8888";
export const TEST_LAUNCH_CONTEXT = parsed?.TEST_LAUNCH_CONTEXT ?? "";
export const FHIR_SERVER_URL =
  parsed?.FHIR_SERVER_URL ?? "https://your.smart.server";
export const CLIENT_ID = parsed?.CLIENT_ID ?? "";
export const CLIENT_SECRET = parsed?.CLIENT_SECRET ?? "";
export const TEST_SITE_NUM = parsed?.TEST_SITE_NUM ?? "123455";

export const LAUNCH_PATH = "/launch";
export const REDIRECT_PATH = "/redirect";
