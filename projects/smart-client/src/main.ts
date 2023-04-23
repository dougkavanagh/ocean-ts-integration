// http://localhost:8888/api/smart-client/launch?iss=http://localhost:8888/api/smart-server/fhir

import cookieParser from "cookie-parser";
import cors from "cors";
import express, { ErrorRequestHandler } from "express";
import launchHandler from "./launch-handler";
import redirectHandler from "./post-redirect-handler";
import logger from "./logger";
import {
  FHIR_SERVER_URL,
  LAUNCH_PATH,
  PORT,
  REDIRECT_PATH,
  TEST_LAUNCH_CONTEXT,
  TEST_SITE_NUM,
} from "./env";

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

app.get(LAUNCH_PATH, launchHandler);
app.get(REDIRECT_PATH, redirectHandler);

app.use(express.json());

app.listen(PORT, () => {
  logger.info(`Smart-client server is listening at http://localhost:${PORT}`);
  let launchUrl = `http://localhost:${PORT}/launch?iss=${encodeURIComponent(
    FHIR_SERVER_URL
  )}&siteNum=${TEST_SITE_NUM}`;
  if (TEST_LAUNCH_CONTEXT) launchUrl = `&launch=${TEST_LAUNCH_CONTEXT}`;
  logger.info(`Simulate a launch by going to ${launchUrl}`);
});

export default app;
