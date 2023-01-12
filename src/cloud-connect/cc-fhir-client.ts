import fetch, { Response } from "node-fetch";

export function authPost({
  serverUrl,
  path,
  body,
  bearerToken,
}: {
  serverUrl: string;
  path: string;
  body: string;
  bearerToken: string;
}): Promise<Response> {
  return authFetch({ serverUrl, path, body, bearerToken, method: "POST" });
}

export function authGet({
  serverUrl,
  path,
  bearerToken,
}: {
  serverUrl: string;
  path: string;
  bearerToken: string;
}): Promise<Response> {
  return authFetch({ serverUrl, path, bearerToken, method: "GET" });
}

export function authFetch({
  serverUrl,
  path,
  bearerToken,
  method,
  body,
}: {
  serverUrl: string;
  path: string;
  bearerToken: string;
  method: string;
  body?: string;
}): Promise<Response> {
  return fetch(serverUrl + path, {
    method,
    body,
    headers: authHeaders(bearerToken),
  });
}

export function authHeaders(bearerToken: string, method?: string) {
  return {
    Authorization: "Bearer " + bearerToken,
    "Content-Type": "application/json",
  };
}

export async function getOAuthBearerToken({
  tokenUrl,
  clientId,
  clientSecret,
}: {
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
}): Promise<string> {
  const creds = {
    clientId,
    clientSecret,
  };
  const authorization =
    "basic " +
    Buffer.from(creds.clientId + ":" + creds.clientSecret).toString("base64");
  const res = await fetch(tokenUrl + "?grant_type=client_credentials", {
    method: "POST",
    headers: {
      Authorization: authorization,
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
  });
  const token = await res.json();
  return token.access_token;
}
