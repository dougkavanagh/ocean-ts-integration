// http://localhost:8888/api/smart-client/launch?iss=http://localhost:8888/api/smart-server/fhir

import cookieParser from "cookie-parser";
import cors from "cors";
import express, { ErrorRequestHandler } from "express";
import logger from "./logger";
import { PORT } from "./env";
import cdsServicesHandler from "./cds-services-handler";

const app: express.Application = express();
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
};
app.use(errorHandler);
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
// https://cds-hooks.org/quickstart/
app.get("cds-services", cdsServicesHandler);

app.use(express.json());

app.listen(PORT, () => {
  logger.info(`CDS services server is listening at http://localhost:${PORT}`);
});

// simulate an HTTP request to the CDS Service:
fetch("http://localhost:8888/api/cds-services/ocean-order-sign", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    hookInstance: "d1577c69-dfbe-44ad-ba6d-3e05e953b2ea",
    fhirServer: "https://r4.smarthealthit.org",
    hook: "order-sign",
  }),
});

export default app;
