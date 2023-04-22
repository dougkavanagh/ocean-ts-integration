import { JwtPayload, SignOptions, verify, sign } from "jsonwebtoken";
import { SESSION_SECRET } from "./env";
import { ErrorMessage } from "./core";
import { Request } from "express";

export function verifyJwt(token: string): JwtPayload | ErrorMessage {
  const result = verify(token, SESSION_SECRET, {});
  if (typeof result === "string") {
    return new ErrorMessage("Invalid JWT: " + result);
  }
  return result;
}

export function verifyBearerToken(req: Request): JwtPayload | ErrorMessage {
  const bearer = req.header("Authorization");
  if (!bearer || !bearer.startsWith("Bearer ")) {
    return new ErrorMessage(
      "Missing Authorization header with 'Bearer ' prefix"
    );
  }
  const token = bearer.split(" ")[1];
  return verifyJwt(token);
}

export function signObject(obj: object, options?: SignOptions): string {
  return sign(
    obj,
    SESSION_SECRET,
    options ?? {
      expiresIn: "24h",
    }
  );
}

export interface SessionUser {
  userId?: string;
  siteId: string;
  profile: {
    displayName: string;
  };
}

export interface SessionContext {
  user?: SessionUser;
}

declare module "express" {
  // this extends the standard Request type with our own SessionContext:
  interface Request {
    context?: SessionContext;
  }
}
