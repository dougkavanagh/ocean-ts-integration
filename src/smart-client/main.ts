// http://localhost:8888/api/smart-client/launch?iss=http://localhost:8888/api/smart-server/fhir

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import launchHandler from "./launch-handler";
import redirectHandler from "./redirect-handler";

const app: express.Application = express();
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.get("/launch", launchHandler);
app.get("/redirect", redirectHandler);

app.use(express.json());

export default app;
