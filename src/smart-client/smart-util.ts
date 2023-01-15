import { Request } from "express";
import { REDIRECT_PATH } from "./env";

export type ScopeType = "patient" | "user" | "system";
export type AccessModifier = "read" | "write" | "*";
export type IdentityType =
  | "Patient"
  | "Practitioner"
  | "Person "
  | "RelatedPerson";

export type FhirResource = {
  hostname: string;
  resourceType: string;
  id: string;
};

export interface UserIdentity {
  scopes: string[];
  fhirUserObject?: FhirResource;
  patientLaunchContext?: FhirResource;
}

export interface SMARTServerConfig {
  version: number;
  expectedAudValue: string;
  expectedIssValue: string;
  fhirUserClaimPath: "fhirUser" | "profile" | string;
  jwksEndpoint?: string;
}

export type ClientLaunchState = {
  issuerUrl: string;
};

export class ErrorMessage {
  message: string;
  httpCode?: number;
  code?: string;
  error?: Error;
  constructor(e: any) {
    if (e.message) {
      this.message = e.message.toString();
    } else {
      this.message = e.toString();
    }
    if (e.code) {
      this.code = e.code.toString();
    }
    if (e.error) {
      this.error = e.error as Error;
    }
    this.httpCode = e.httpCode;
  }
}
export function isErrorMessage(obj: any): obj is ErrorMessage {
  return obj && obj.message;
}

export function getRedirectUrl(req: Request): string {
  return req.protocol + "://" + req.get("Host") + REDIRECT_PATH;
}
