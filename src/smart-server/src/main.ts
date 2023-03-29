import bodyParser from "body-parser";
import cors from "cors";
import express, { Request, Response, Router } from "express";
import { PORT } from "./env";
import { verifyBearerToken } from "./auth-utils";
import { isErrorMessage } from "./core";
import { handleTokenRequest } from "./handlers/token-handler";
import { PatientFhirHandler } from "./handlers/patient-fhir-handler";
import { WellKnownOidcConfigurationHandler } from "./handlers/well-known-oidc-configuration-handler";
import { WellKnownSmartConfigurationHandler } from "./handlers/well-known-smart-configuration-handler";

const app: express.Application = express();
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
export default app;

function createRouters() {
  createAuthRouter();
  const fhirRouter = createAuthorizedFhirRouter();
  createFhirRoutes(fhirRouter);
}
function createAuthorizedFhirRouter() {
  const fhirRouter = express.Router();
  app.use("/fhir", fhirRouter);
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
  authRouter.post("/token", handleTokenRequest);
  app.use("/auth", authRouter);
}

function createFhirRoutes(fhirRouter: Router) {
  PatientFhirHandler.setup(fhirRouter);
  WellKnownOidcConfigurationHandler.setup(fhirRouter);
  WellKnownSmartConfigurationHandler.setup(fhirRouter);
}

app.listen(PORT, () => {
  console.log(`Webhook server is listening at http://localhost:${PORT}`);
});
