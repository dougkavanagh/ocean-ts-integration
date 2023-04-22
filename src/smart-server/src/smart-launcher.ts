import { JwtPayload } from "jsonwebtoken";
import { SessionContext, signObject } from "./auth-utils";
import { FHIR_ENDPOINT_PREFIX, SERVER_URL, SMART_CLIENT_URL } from "./env";
import { LaunchToken } from "./launch-token";

export function createSmartLaunchUrl({
  context,
  ptId,
  action,
  clientSiteNum,
}: {
  context: SessionContext;
  ptId?: string;
  action?: string;
  clientSiteNum?: string;
}) {
  const userId = context.user?.userId;
  if (!userId) {
    return { error: "Missing user" };
  }
  const siteId = context.user?.siteId;
  if (!siteId) {
    return { error: "Missing site" };
  }
  const iss = SERVER_URL + FHIR_ENDPOINT_PREFIX;
  const launchToken: LaunchToken = {
    userId,
    siteId,
    iss: iss,
    ptId: ptId,
    intent: action,
  };
  const launch = signObject(launchToken, {
    expiresIn: 60,
  });

  const clientBaseLaunchUrl = SMART_CLIENT_URL;
  const url =
    clientBaseLaunchUrl +
    (clientBaseLaunchUrl.includes("?") ? "&" : "?") +
    `iss=${encodeURIComponent(
      iss
    )}&launch=${launch}&action=${action}&siteNum=${clientSiteNum}`;
  return url;
}
