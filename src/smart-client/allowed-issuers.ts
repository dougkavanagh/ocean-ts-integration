export const SESSION_SECRET = process.env.SESSION_SECRET ?? "secret";
export const DEPLOY_URL = process.env.DEPLOY_URL ?? "http://localhost:3000";
export const ENDPOINT_PUBLIC_PREFIX =
  process.env.ENDPOINT_PUBLIC_PREFIX ?? "/api";
export const PROD = process.env.NODE_ENV === "production";

export interface AllowedIssuer {
  iss: string;
}

const allowedConfigs: AllowedIssuer[] = [
  // The list is hardcoded here for testing simplicity; feel free to add more
  // In Ocean, this allowlist is updated as needed by the support team
  {
    iss: "https://launch.smarthealthit.org/v/r4/fhir",
  },
  {
    iss: "http://localhost:8888/api/fhir",
  },
];

export function lookupIssuerInAllowlist(iss: string): AllowedIssuer | null {
  return (
    allowedConfigs.find((config) => {
      return config.iss === iss;
    }) || null
  );
}
