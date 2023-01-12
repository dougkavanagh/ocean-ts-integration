import { config } from "dotenv";
const parsed = config().parsed;

export const OCEAN_HOST = parsed?.OCEAN_HOST ?? "";
export const CLIENT_ID = parsed?.CLIENT_ID ?? "";
export const CLIENT_SECRET = parsed?.CLIENT_SECRET ?? "";

export const REFERRAL_REF = parsed?.REFERRAL_REF ?? "";
export const APPOINTMENT_ID = parsed?.APPOINTMENT_ID ?? "";
