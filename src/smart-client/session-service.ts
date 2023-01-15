import { JwtPayload, sign, SignOptions, verify } from "jsonwebtoken";
import { SESSION_SECRET } from "./allowed-issuers";
import { ErrorMessage } from "./smart-util";

export function verifyJwt(token: string): JwtPayload | ErrorMessage {
  const result = verify(token, SESSION_SECRET, {});
  if (typeof result === "string") {
    return new ErrorMessage("Invalid JWT: " + result);
  }
  return result;
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
