import { RequestHandler, NextFunction, Request, Response } from "express";
import { signObject } from "./session-service";
import { Issuer, Client } from "openid-client";
import { ClientLaunchState, getRedirectUrl } from "./smart-util";
import logger from "./logger";
import { CLIENT_ID, REDIRECT_PATH } from "./env";

// https://www.npmjs.com/package/openid-client

const handler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const issuerUrl = checkIssuer(req);
    checkAction(req);

    logger.info(
      `Checking OIDC support at ${issuerUrl} via openid-client's discover feature:`
    );
    const issuer: Issuer<Client> = await Issuer.discover(issuerUrl);
    logger.info(`Discovery was successful`);
    const clientId = CLIENT_ID;
    const redirectUrl = getRedirectUrl(req);
    const client = new issuer.Client({
      client_id: clientId,
      redirect_uris: [redirectUrl],
      response_types: ["code"],
    });
    const state: ClientLaunchState = {
      issuerUrl: issuerUrl,
    };
    const smartServerRedirectUrl = client
      .authorizationUrl({
        response_type: "code",
        client_id: clientId,
        aud: issuerUrl,
        scope: [
          "launch",
          "launch/patient",
          "online_access",
          "openid",
          "profile",
          "fhirUser",
          "patient/Patient.read",
          "patient/Observation.read",
          "patient/$everything",
          "user/*.*",
          "user/Practitioner.read",
        ].join(" "),
        redirect_uri: redirectUrl,
        launch: req.query.launch?.toString(),
        state: signObject(state),
      })
      .replace("https://localhost", "http://localhost");
    logger.info(
      `Redirecting to SMART authorization endpoint at ${smartServerRedirectUrl}...`
    );
    res.redirect(smartServerRedirectUrl);
  } catch (e: unknown) {
    next(e);
  }
};
export default handler;
function checkAction(req: Request) {
  const action = req.query.action?.toString();
  if (!action) {
    throw "Missing action parameter in the launch URL";
  }
  const supportedActionParameters = [
    "viewMap",
    "viewHealthServices",
    "viewReferralFacourite",
    "searchHealthMap",
    "referDirect",
    "portal",
    "sendMessage",
    "addForm",
  ];
  if (supportedActionParameters.indexOf(action) === -1) {
    logger.warn(
      "Unrecognized SMART action parameter in the launch URL: " + action
    );
  }
}

function checkIssuer(req: Request) {
  const issuerUrl = req.query.iss?.toString();
  if (!issuerUrl) {
    throw "missing iss URL parameter";
  }
  return issuerUrl;
}
