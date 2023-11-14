import bodyParser from "body-parser";
import cors from "cors";
import express, {
  ErrorRequestHandler,
  Request,
  Response,
  Router,
} from "express";
import {
  ALLOWED_CLIENT_ID,
  AUTH_ENDPOINT_PREFIX,
  FHIR_ENDPOINT_PREFIX,
  PORT,
  OCEAN_ACTION
} from "./env";
import { verifyBearerToken } from "./auth-utils";
import { isErrorMessage } from "./core";
import { handleTokenRequest } from "./handlers/token-handler";
import { PatientFhirHandler } from "./handlers/patient-fhir-handler";
import { WellKnownOidcConfigurationHandler } from "./handlers/well-known-oidc-configuration-handler";
import { WellKnownSmartConfigurationHandler } from "./handlers/well-known-smart-configuration-handler";
import { createSmartLaunchUrl } from "./smart-launcher";
import { handleAuthorizeRequest } from "./handlers/authorize-handler";
import logger from "./logger";
import { handleKeysRequest } from "./handlers/keys-handler";

const AUTHORIZE_PATH = "/authorize";
const TOKEN_PATH = "/token";

function createRouters() {
  createAuthRouter();
  const fhirRouter = createAuthorizedFhirRouter();
  createFhirRoutes(fhirRouter);
}
function createAuthorizedFhirRouter() {
  const fhirRouter = express.Router();
  app.use(FHIR_ENDPOINT_PREFIX, fhirRouter);
  fhirRouter.use(async (req: Request, res: Response, next) => {
    if (
      req.path === "/CapabilityStatement" ||
      req.path.startsWith("/.well-known")
    ) {
      return next();
    }
    const verifyResult = verifyBearerToken(req);
    if (isErrorMessage(verifyResult)) {
      return res
        .status(401)
        .send("Invalid Bearer token: " + verifyResult.message);
    }
    req.context = {
      user: verifyResult.user,
    };
    next();
  });
  fhirRouter.use(function (req, res, next) {
    if (
      (req.method === "PUT" || req.method === "POST") &&
      !req.headers["content-type"]?.includes("application/fhir+json")
    ) {
      return res.send(415);
    }
    next();
  });
  return fhirRouter;
}

function createAuthRouter() {
  const authRouter = express.Router();
  authRouter.all(AUTHORIZE_PATH, handleAuthorizeRequest);
  authRouter.post(TOKEN_PATH, handleTokenRequest);
  authRouter.get("/keys", handleKeysRequest);
  WellKnownOidcConfigurationHandler.setup(authRouter);
  app.use(AUTH_ENDPOINT_PREFIX, authRouter);
}

function createFhirRoutes(fhirRouter: Router) {
  PatientFhirHandler.setup(fhirRouter);
  PatientFhirHandler.setup(fhirRouter);
  WellKnownSmartConfigurationHandler.setup(fhirRouter);
}

const app: express.Application = express();
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
};
app.use(errorHandler);
app.use(express.urlencoded({ extended: true }));
app.use(
  bodyParser.json({ type: ["application/fhir+json", "application/json"] })
);
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
createRouters();
app.use(function (req, res, next) {
  logger.warn(`404 not found: ${req.method} ${req.path}`);
  res.status(404).send("Sorry, page not found");
});
app.listen(PORT, () => {
  const serverUrl = `http://localhost:${PORT}`;
  console.log(`SMART server is listening at ${serverUrl}`);
  console.log(`The following endpoints should be publicly accessible:`);
  console.log(
    `${serverUrl}${FHIR_ENDPOINT_PREFIX}/.well-known/smart-configuration`
  );
  console.log(
    `${serverUrl}${AUTH_ENDPOINT_PREFIX}/.well-known/openid-configuration`
  );
  console.log();
  console.log(
    `Ocean should have an allowlist entry with the following parameters:`
  );
  console.log(`Client ID: ` + ALLOWED_CLIENT_ID);
  console.log(`Client Secret: *** (check your environment variable)`);
  console.log(`Server URL: ${serverUrl}${FHIR_ENDPOINT_PREFIX}`);
  console.log(
    `Token Endpoint: ${serverUrl}${AUTH_ENDPOINT_PREFIX}${TOKEN_PATH}`
  );
  console.log(
    `Authorization Endpoint: ${serverUrl}${AUTH_ENDPOINT_PREFIX}${AUTHORIZE_PATH}`
  );
  console.log(`Token Issuer URL: ${serverUrl}${AUTH_ENDPOINT_PREFIX}`);
  console.log();

  console.log(
    "Imagine this is an EMR with a 'View Patient in Ocean' launch button..."
  );
  const OCEAN_TEST_SITE_NUM = "1234";
  const smartLaunchUrl = createSmartLaunchUrl({
    context: {
      user: {
        userId: "user12345",
        siteId: "site12345",
        profile: {
          displayName: "Test User",
        },
      },
    },
    ptId: "pt12345",
    clientSiteNum: OCEAN_TEST_SITE_NUM,
    action: OCEAN_ACTION,
  });
  console.log(
    `Clicking this button in EMR opens the following SMART launch URL in a new tab in the user's default web browser:\n${smartLaunchUrl}`
  );
});
export default app;
