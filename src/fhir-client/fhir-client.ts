import fetch from "node-fetch";
import { Response } from "node-fetch";
import fs from "fs";
import { fhirR4 } from "@smile-cdr/fhirts";

export async function readReferralPdf({
  oceanHost,
  bearerToken,
  fileName,
}: {
  oceanHost: string;
  bearerToken: string;
  fileName: string;
}) {
  const res = await authGet({
    oceanHost,
    bearerToken,
    path: `/svc/fhir/v1/ServiceRequest/{referralRef}/$letter`,
  });
  const fileStream = fs.createWriteStream(fileName);
  await readPdf(res, fileStream);
}

export async function readPdf(
  res: Response,
  fileStream: fs.WriteStream
): Promise<void> {
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", reject);
    fileStream.on("finish", resolve);
  });
  res.body.resume();
}

export function authPost({
  oceanHost,
  bearerToken,
  path,
  body,
}: {
  oceanHost: string;
  bearerToken: string;
  path: string;
  body: string;
}): Promise<Response> {
  console.log("Posting FHIR JSON:");
  console.log(body);
  return fetch(oceanHost + path, {
    method: "POST",
    body,
    headers: authHeaders(bearerToken),
  });
}

export function authGet({
  oceanHost,
  bearerToken,
  path,
}: {
  oceanHost: string;
  bearerToken: string;
  path: string;
}): Promise<Response> {
  return fetch(oceanHost + path, {
    method: "GET",
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
  oceanHost,
  clientId,
  clientSecret,
}: {
  oceanHost: string;
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
  const res = await fetch(
    oceanHost + "/svc/oauth2/token?grant_type=client_credentials",
    {
      method: "POST",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
    }
  );
  const token = await res.json();
  return token.access_token;
}

export async function postReferralFhirMessage({
  bearerToken,
  message,
  oceanHost,
}: {
  oceanHost: string;
  bearerToken: string;
  message: fhirR4.Bundle;
}) {
  const body = JSON.stringify(message);
  return await authPost({
    oceanHost,
    bearerToken,
    path: "/svc/fhir/v1/$process-messages",
    body,
  });
}
