function validateClientCredentials(
  client_id: string,
  client_secret: string
): boolean {
  // TBI: check against your EMR's dynamic allowlist of SMART clients
  return client_id === "my-client-id" && client_secret === "my-client-secret";
}

export const ClientService = {
  validateClientCredentials,
};
