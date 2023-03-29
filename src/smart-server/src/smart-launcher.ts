import { JwtPayload } from 'jsonwebtoken';
import { SessionContext, signObject } from './auth-utils';
import { HOST, SMART_CLIENT_URL } from './env';

const BASE_URL = HOST;
export const ISSUER_URL = `${BASE_URL}/fhir`;

export interface LaunchToken extends JwtPayload {
  userId: string;
  siteId: string;
  iss: string;
  ptId?: string;
  intent?: string;
}

export function createSmartLaunchUrl({
  context,
  ptId,
  intent,
}: {
  context: SessionContext;
  ptId?: string;
  intent?: string;
}) {
  const userId = context.user?.userId;
  if (!userId) {
    return { error: "Missing user" };
  }
  const siteId = context.user?.siteId;
  if (!siteId) {
    return { error: "Missing site" };
  }
  const iss = ISSUER_URL;
  const launchToken: LaunchToken = {
    userId,
    siteId,
    iss: iss,
    ptId: ptId,
    intent: intent,
  };
  const launch = signObject(launchToken, {
    expiresIn: 60,
  });

  const clientBaseLaunchUrl = SMART_CLIENT_URL;
  const url =
    clientBaseLaunchUrl +
    (clientBaseLaunchUrl.includes("?") ? "&" : "?") +
    `iss=${encodeURIComponent(iss)}&launch=${launch}`;
  return {
    url: url,
  };
}
