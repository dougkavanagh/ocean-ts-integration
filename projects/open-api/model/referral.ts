export interface Referral {
  referralRef: string;
  referralTargetRef: string;
  referrer: ClinicianData;
  assistant: ClinicianData;
  services: string[];
  externalServiceId: string;
  description: string;
  encryptedPtData: EncryptedBlockDto;
  oneTimeKeyEncryptedWithTargetPublicKey: string;
  oneTimeKeyEncryptedWithSitePublicKey: string;
  oneTimeKeyEncryptedWithSiteSEK: EncryptedBlockDto;
  externalRef: string;
  sourceExternalRef: string;
  masterReferralRef: string;
  master: boolean;
  creationDate: Date;
  modificationDate: Date;
  sentDate: Date;
  status: string;
  scheduledAppointment: Date;
  scheduledAppointment2: Date;
  appointments: ReferralDataAppointment[];
  bookingComments: string;
  bookingFileRefs: AttachmentRef[];
  bookingUrl: string;
  internalConversation: ReferralComment[];
  externalConversation: ReferralComment[];
  communicationType: CommunicationType;
  cancellationReason: string;
  srcSiteName: string;
  srcSiteNum: string;
}

enum CommunicationType {
  E_REFERRAL,
  E_CONSULT,
  PROVIDER_MESSAGE,
}
export interface EncryptedBlockDto {
  data: string; //base64
  iv: string; //base64
}

export interface ReferralAttachment {
  contentType: string; // MIME type
  encryptedData: EncryptedBlockDto;
}

export interface ReferralComment {
  ref?: string;
  message?: string; //plaintext message
  userName?: string;
  userFullName?: string;
  attachmentRefDtos?: AttachmentRef[];
  attachmentSrc?: string;
  commentDate?: Date;
  siteNum?: string;
  targetSiteNum: string;
  targetRtRef?: string | null;
  targetUserName?: string | null;
  targetDesc?: string;
  showForOtherSites?: boolean;
  reviewed?: ReviewInfo | null;
  encryptedMsg?: EncryptedBlockDto | null;
  eConsultData?: EConsultDto | null;
  tags?: string[];
}

export interface ReferralDataAppointment {
  wtType: WaitTimeType;
  apptType: string;
  date: Date;
  hasTime: boolean;
  waitTime: string;
}
enum WaitTimeType {
  WAIT_1A,
  WAIT_1B,
  WAIT_1,
  WAIT_2,
}

export interface EConsultDto {
  minutes: number;
  minutesReason: string;
}

export interface ReviewInfo {
  user: string;
  date: Date;
}

export interface ClinicianData {
  firstName: string;
  surname: string;
  professionalId: string;
  billingNum: string;
  signature: string;
  clinicianType: string;
  address: AddressData;
}

export interface AddressData {
  line1: string;
  line2: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
  phone: string;
  fax: string;
  email: string;
  website: string;
}

export interface AttachmentRef {
  fileRef: string;
  fileName: string;
  encryptedFileName?: EncryptedBlockDto;
  encryptedEncryptionKey?: EncryptedBlockDto;
  fromEmr?: boolean;
  emrFileId?: string;
}
