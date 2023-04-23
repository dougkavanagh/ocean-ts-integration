import fetch from "node-fetch";
import { Response } from "node-fetch";
import { decryptPrivateKeys, PrivateKey } from "./encryption-util";
import {
  ReferralAttachment,
  EncryptedBlockDto,
  Referral,
  ReferralComment,
} from "./model/referral";

export interface SiteCreds {
  oceanHost: string;
  siteNum: string;
  siteKey: string;
  siteCredential: string;
  sharedEncryptionKey: string;
}

export function authPost({
  creds,
  path,
  body,
  headers,
}: {
  creds: SiteCreds;
  path: string;
  body: string;
  headers?: { [key: string]: string };
}): Promise<Response> {
  return fetch(creds.oceanHost + path, {
    method: "POST",
    body,
    headers: headers ?? authHeaders(creds),
  });
}

export function authGet({
  creds,
  path,
  headers,
}: {
  creds: SiteCreds;
  path: string;
  headers?: { [key: string]: string };
}): Promise<Response> {
  return fetch(creds.oceanHost + path, {
    method: "GET",
    headers: headers ?? authHeaders(creds),
  });
}

export function authHeaders(creds: SiteCreds): { [key: string]: string } {
  return {
    siteNum: creds.siteNum,
    siteKey: creds.siteKey,
    siteCredential: creds.siteCredential,
    "Content-Type": "application/json",
  };
}

export async function getPrivateKeys({
  creds,
}: {
  creds: SiteCreds;
}): Promise<PrivateKey[]> {
  const result = await authGet({
    creds,
    path: "/svc/v1/site/privateKey",
  });
  const privateKeyData: EncryptedBlockDto = {
    data: await result.json(),
    iv: result.headers.get("iv") ?? "",
  };
  if (!privateKeyData.iv) {
    throw new Error("No iv found in response");
  }
  return decryptPrivateKeys({
    sharedEncryptionKey: creds.sharedEncryptionKey,
    privateKeyData,
  });
}

export function isError(result: any): result is Error {
  return result.message !== undefined && result.name !== undefined;
}

export async function getReferral({
  referralRef,
  creds,
}: {
  referralRef: string;
  creds: SiteCreds;
}): Promise<Referral | Error> {
  const response = await authGet({
    creds,
    path: `/svc/v1/referrals/${referralRef}`,
  });
  if (!response.ok) {
    return new Error(await response.text());
  }
  return (await response.json()) as Referral;
}

export async function getReferralAttachment({
  creds,
  referralRef,
  attachmentRef,
}: {
  creds: SiteCreds;
  referralRef: string;
  attachmentRef: string;
}): Promise<ReferralAttachment | Error> {
  const result = await authGet({
    creds,
    path: `/svc/v1/referrals/${referralRef}/attachments/${attachmentRef}`,
  });
  if (!result.ok) {
    return new Error(result.statusText);
  }
  return (await result.json()) as ReferralAttachment;
}

export async function saveReferralAttachment({
  creds,
  referralRef,
  attachment,
}: {
  creds: SiteCreds;
  referralRef: string;
  attachment: ReferralAttachment;
}): Promise<true | Error> {
  const result = await authPost({
    creds,
    path: `/svc/v1/referrals/${referralRef}/attachments`,
    body: attachment.encryptedData.data,
    headers: {
      ivBase64: attachment.encryptedData.iv,
      ...authHeaders(creds),
    },
  });
  if (!result.ok) {
    return new Error(result.statusText);
  }
  return true;
}

export async function addMessage({
  creds,
  referralRef,
  message,
}: {
  creds: SiteCreds;
  referralRef: string;
  message: ReferralComment;
}): Promise<string | Error> {
  // https://ocean.cognisantmd.com/public/apiDocs.html#operation/addMessageUsingPOST
  const result: Response = await authPost({
    creds,
    path: `/svc/v1/referrals/${referralRef}/messages`,
    body: JSON.stringify({ message }),
  });
  if (!result.ok) {
    // console.log(await result.text());
    return new Error(result.statusText);
  }
  const messageRef = await result.text();
  return messageRef;
}
