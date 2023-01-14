export const SESSION_SECRET = process.env.SESSION_SECRET ?? "secret";
export const DEPLOY_URL = process.env.DEPLOY_URL ?? "http://localhost:3000";
export const ENDPOINT_PUBLIC_PREFIX =
  process.env.ENDPOINT_PUBLIC_PREFIX ?? "/api";
export const PROD = process.env.NODE_ENV === "production";

export interface Config {
  iss: string;
}

const allowedConfigs: Config[] = [
  // The list is hardcoded here for testing simplicity; feel free to add more
  // In Ocean, this allowlist is updated as needed by the support team
  {
    iss: "https://launch.smarthealthit.org/v/r4/fhir",
  },
  {
    iss: "http://localhost:8888/api/fhir",
  },
];

export function lookupIssuerInAllowlist(iss: string): Config | null {
  return (
    allowedConfigs.find((config) => {
      return config.iss === iss;
    }) || null
  );
}

export const redirectUrl =
  DEPLOY_URL + ENDPOINT_PUBLIC_PREFIX + "/smart-client/redirect";

export const ISS_COOKIE = "smart-iss";
// export const CLIENT_ID = "zELcpfANLqY7Oqas";
export const CLIENT_ID = "zELcpfANLqY7Oqas";
const config = {
  lookup: lookupIssuerInAllowlist,
  SESSION_SECRET,
  PROD,
  CLIENT_ID,
  ISS_COOKIE,
  redirectUrl,
};
export default config;
