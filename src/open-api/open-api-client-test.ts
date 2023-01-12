import {
  addMessage,
  getPrivateKeys,
  getReferral,
  isError,
  saveReferralAttachment,
  SiteCreds,
} from "./open-api-client";
import { getSiteCreds, REFERRAL_REF } from "../env";
import {
  decryptReferralOneTimeKey,
  encryptObject,
  encryptString,
  Key,
} from "./encryption-util";
import { Referral, ReferralComment } from "./model/referral";
import { generateKey, encryptBytes } from "./encryption-util";

export async function testAddMessage() {
  const referralRef = REFERRAL_REF;
  const creds: SiteCreds = getSiteCreds();
  const targetSiteNum = creds.siteNum;
  const referral: Referral | Error = await getReferral({
    creds,
    referralRef,
  });
  if (isError(referral)) {
    throw referral;
  }
  const privateKeys = await getPrivateKeys({ creds });
  const oneTimeKey: Key | false = decryptReferralOneTimeKey({
    referral,
    sharedEncryptionKey: creds.sharedEncryptionKey,
    privateKeys,
  });
  if (!oneTimeKey) {
    throw new Error("Could not decrypt one time key");
  }
  const attachmentEncryptionKey = generateKey();
  const message: ReferralComment = {
    encryptedMsg: encryptObject(
      {
        message: "Hello World",
      },
      oneTimeKey
    ),
    targetSiteNum,
    attachmentRefDtos: [
      {
        fileRef: "test",
        fileName: "myTestFile.txt",
        encryptedFileName: encryptString(
          "myTestFileWithPHIInTheName.txt",
          oneTimeKey
        ),
        encryptedEncryptionKey: encryptBytes(
          attachmentEncryptionKey,
          oneTimeKey
        ),
      },
    ],
  };
  const messageRef = await addMessage({
    creds,
    referralRef,
    message,
  });
  if (isError(messageRef)) {
    throw messageRef;
  }
  saveReferralAttachment({
    creds,
    referralRef,
    attachment: {
      contentType: "text/plain",
      encryptedData: encryptString("Hello World", attachmentEncryptionKey),
    },
  });
}
