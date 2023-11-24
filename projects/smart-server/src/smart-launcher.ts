import { SessionContext, signObject } from "./auth-utils";
import { SMART_CLIENT_URL, FHIR_SERVER_URL, TOKEN_ISSUER_URL } from "./env";
import { LaunchToken } from "./launch-token";

export function createSmartLaunchUrl({
  context,
  ptId,
  action,
  clientSiteNum,
  resource,
}: {
  context: SessionContext;
  ptId?: string;
  action?: string;
  clientSiteNum?: string;
  resource?: string;
}) {
  const userId = context.user?.userId;
  if (!userId) {
    return { error: "Missing user" };
  }
  const siteId = context.user?.siteId;
  if (!siteId) {
    return { error: "Missing site" };
  }
  const launchToken: LaunchToken = {
    userId,
    siteId,
    iss: TOKEN_ISSUER_URL,
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
      FHIR_SERVER_URL
    )}&launch=${launch}&action=${action}${
      resource ? "&resource=" + resource : ""
    }&siteNum=${clientSiteNum}`;
  return url;
}
