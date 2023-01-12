import { config } from "dotenv";
import { SiteCreds } from "./open-api/open-api-client";
const parsed = config().parsed;

export const OCEAN_HOST = parsed?.OCEAN_HOST ?? "";
export const REFERRAL_REF = parsed?.REFERRAL_REF ?? "";
export const CLIENT_ID = parsed?.CLIENT_ID ?? "";
export const CLIENT_SECRET = parsed?.CLIENT_SECRET ?? "";
export const SHARED_ENCRYPTION_KEY = parsed?.SHARED_ENCRYPTION_KEY ?? "";
export const SITE_NUM = parsed?.SITE_NUM ?? "";
export const APPOINTMENT_ID = parsed?.APPOINTMENT_ID ?? "";

export const PORT = parsed?.PORT ?? "8888";
export const FHIR_SERVER_URL =
  parsed?.FHIR_SERVER_URL ?? "https://your.smart.server";

export function getSiteCreds(): SiteCreds {
  return {
    oceanHost: OCEAN_HOST,
    siteKey: CLIENT_ID,
    siteCredential: CLIENT_SECRET,
    sharedEncryptionKey: SHARED_ENCRYPTION_KEY,
    siteNum: SITE_NUM,
  };
}
