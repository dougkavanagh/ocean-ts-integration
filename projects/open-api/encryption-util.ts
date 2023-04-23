// needed for CryptoJS to load in node:
(global as any).navigator = { appName: "protractor" };
(global as any).window = {};
// end jsencrypt hack

import CryptoJS from "crypto-js";
import JSEncrypt from "jsencrypt";
import { Referral, EncryptedBlockDto } from "./model/referral";

const KEY_LEN_BYTES = 16;
const IV_LEN_BYTES = 16;

export interface PrivateKey {
  n: string;
  e: string;
  d: string;
  p: string;
  q: string;
  dmp1: string;
  dmq1: string;
  coeff: string;
}

export type Bytes = CryptoJS.lib.WordArray;
export type Key = Bytes;

export function generateKey(): Key {
  return CryptoJS.lib.WordArray.random(16);
}

export function toBase64(bytes: CryptoJS.lib.WordArray): string {
  return CryptoJS.enc.Base64.stringify(bytes);
}

export function decryptWithSharedEncryptionKey({
  encryptedData,
  sharedEncryptionKey,
}: {
  encryptedData: EncryptedBlockDto;
  sharedEncryptionKey: string;
}): Bytes {
  const sekAsBytes = getSecretKeyBytes(sharedEncryptionKey);
  const ivAsBytes = CryptoJS.enc.Base64.parse(encryptedData.iv);
  const decryptedBytes = CryptoJS.AES.decrypt(encryptedData.data, sekAsBytes, {
    iv: ivAsBytes,
  });
  return decryptedBytes;
}

export function toUtf8(bytes: Bytes): string {
  return CryptoJS.enc.Utf8.stringify(bytes);
}

export function decryptPrivateKeys({
  privateKeyData,
  sharedEncryptionKey,
}: {
  privateKeyData: EncryptedBlockDto;
  sharedEncryptionKey: string;
}): PrivateKey[] {
  const privateKeys: Bytes = decryptWithSharedEncryptionKey({
    encryptedData: privateKeyData,
    sharedEncryptionKey: sharedEncryptionKey,
  });
  const privateKeysAsUtf8 = toUtf8(privateKeys);
  const privateKeysArray = privateKeysAsUtf8.split("|");
  return privateKeysArray.map(function (privateKeyAsJson: string) {
    return JSON.parse(privateKeyAsJson) as PrivateKey;
  });
}

export function decryptReferralPatient({
  referral,
  privateKeys,
  sharedEncryptionKey,
}: {
  referral: Referral;
  privateKeys: PrivateKey[];
  sharedEncryptionKey: string;
}) {
  const oneTimeKey = decryptReferralOneTimeKey({
    privateKeys,
    referral,
    sharedEncryptionKey,
  });
  if (!oneTimeKey) {
    return false;
  }
  const ivBytes = CryptoJS.enc.Base64.parse(referral.encryptedPtData.iv);
  const textBytes = CryptoJS.AES.decrypt(
    referral.encryptedPtData.data,
    oneTimeKey,
    { iv: ivBytes }
  );
  if (textBytes.words.length > 0) {
    const decryptedText = CryptoJS.enc.Utf8.stringify(textBytes);
    return JSON.parse(decryptedText);
  } else {
    return false;
  }
}

export function decryptReferralOneTimeKey({
  referral,
  privateKeys,
  sharedEncryptionKey,
}: {
  referral: Referral;
  privateKeys: PrivateKey[];
  sharedEncryptionKey: string;
}): Key | false {
  if (referral.oneTimeKeyEncryptedWithSiteSEK) {
    return decryptWithSharedEncryptionKey({
      encryptedData: referral.oneTimeKeyEncryptedWithSiteSEK,
      sharedEncryptionKey: sharedEncryptionKey,
    });
  }
  return decryptWithPrivateKeys(
    privateKeys,
    referral.oneTimeKeyEncryptedWithTargetPublicKey
  );
}

function getSecretKeyBytes(secretKey: string) {
  // We need the bytes of our keys to use in decryption
  while (secretKey.length < 16) secretKey += "0"; //Zero pad the secretKey to 16 bytes
  return CryptoJS.enc.Utf8.parse(secretKey);
}

function decryptWithPrivateKeys(
  privateKeys: PrivateKey[],
  cipherTextHex: string
): Key | false {
  const e = null;
  if (!privateKeys || privateKeys.length === 0) {
    throw new Error("no private keys specified");
  }
  let result: false | string = false;
  try {
    privateKeys.some(function (privateKey) {
      //try all the private keys until one works
      result = decryptWithPrivateKey(privateKey, cipherTextHex);
      return result;
    });
  } catch (e) {
    result = false;
  }
  return result;
}

function decryptWithPrivateKey(
  privateKey: PrivateKey,
  cipherTextHex: string
): string | false {
  if (typeof privateKey == "string") {
    privateKey = JSON.parse(privateKey);
  }
  const rsa = new JSEncrypt();
  rsa.setKey("");
  rsa
    .getKey()
    .setPrivateEx(
      privateKey.n,
      privateKey.e,
      privateKey.d,
      privateKey.p,
      privateKey.q,
      privateKey.dmp1,
      privateKey.dmq1,
      privateKey.coeff
    );
  return rsa.decrypt(cipherTextHex);
}

export function encryptObject(object: unknown, key: Key) {
  return encryptString(JSON.stringify(object), key);
}

export function encryptString(plaintext: string, key: Key) {
  return encryptBytes(CryptoJS.enc.Utf8.parse(plaintext), key);
}

export function encryptBytes(bytes: Bytes, key: Key) {
  const ivBytes: Bytes = CryptoJS.lib.WordArray.random(16);

  const encryptedCryptoJS = CryptoJS.AES.encrypt(
    bytes,
    truncateToUsableAESKey(key),
    { iv: ivBytes }
  );
  const encryptedBlockDto = {
    data: CryptoJS.enc.Base64.stringify(encryptedCryptoJS.ciphertext),
    iv: CryptoJS.enc.Base64.stringify(ivBytes),
  };
  return encryptedBlockDto;
}

function truncateToUsableAESKey(keyBytes: Bytes) {
  if (keyBytes.sigBytes > 32) {
    keyBytes.sigBytes = 32;
  } else if (keyBytes.sigBytes > 24 && keyBytes.sigBytes < 32) {
    keyBytes.sigBytes = 24;
  } else if (keyBytes.sigBytes > 16 && keyBytes.sigBytes < 24) {
    keyBytes.sigBytes = 16;
  }
  return keyBytes;
}
