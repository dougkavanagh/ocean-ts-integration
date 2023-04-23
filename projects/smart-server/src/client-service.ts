import { ALLOWED_CLIENT_ID, ALLOWED_CLIENT_SECRET } from "./env";

function validateClientCredentials(
  client_id: string,
  client_secret: string
): boolean {
  // TBI: check against your EMR's dynamic allowlist of SMART clients
  return client_id === ALLOWED_CLIENT_ID && client_secret === ALLOWED_CLIENT_SECRET;
}

export const ClientService = {
  validateClientCredentials,
};
