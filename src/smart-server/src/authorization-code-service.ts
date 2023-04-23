import { id } from "./core";
import { LaunchToken } from "./launch-token";

export interface AuthorizationCode {
  id: string;
  userId?: string;
  clientId: string;
  siteId: string;
  ptId?: string;
  encounter?: string;
  idTokenIssuer?: string;
  scopes: string[];
  codeChallenge?: string | null;
  codeChallengeMethod?: string | null;
  expiresAt: Date;
}

// replace this with Redis or a database:
const store = new Map<string, AuthorizationCode>();

async function findAndRemoveById(
  id: AuthorizationCode["id"]
): Promise<AuthorizationCode | null> {
  return store.get(id) ?? null;
}

async function createFromLaunchToken(
  {
    userId,
    ptId,
    encounter,
    siteId,
    clientId,
    iss,
    codeChallenge,
    codeChallengeMethod,
  }: LaunchToken,
  scopes: string[]
): Promise<AuthorizationCode> {
  const code: AuthorizationCode = {
    id: id(),
    userId,
    ptId,
    encounter,
    siteId,
    expiresAt: expiresAt(),
    idTokenIssuer: iss,//
    codeChallenge: codeChallenge,
    codeChallengeMethod: codeChallengeMethod,
    scopes: scopes,
    clientId: clientId,
  };
  store.set(code.id, code);
  return code;
}

function expiresAt() {
  return new Date(Date.now() + 1000 * 60 * 60 * 24);
}

export const AuthorizationCodeService = {
  createFromLaunchToken,
  findAndRemoveById,
};
