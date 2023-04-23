import { JwtPayload } from "jsonwebtoken";

export interface LaunchToken extends JwtPayload {
  userId: string;
  ptId?: string;
  encounter?: string;
  siteId: string;
  iss: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
}
