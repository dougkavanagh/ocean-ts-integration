import { JwtPayload } from "jsonwebtoken";

export interface LaunchToken extends JwtPayload {
  userId: string;
  ptId?: string;
  encounter?: string;
  siteId: string;
  clientId: string;
  iss: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
  scopes: string[];
}
