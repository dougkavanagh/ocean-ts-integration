// http://localhost:8888/api/smart-client/launch?iss=http://localhost:8888/api/smart-server/fhir

import express, { ErrorRequestHandler } from "express";
import logger from "./logger";
import { PORT } from "./env";
import {
  cdsServicesHandler,
  OCEAN_EORDER_DECISION_SUPPORT_ID,
} from "./cds-services-handler";
import { orderSignHookHandler } from "./order-sign-hook-handler";
import fetch from "node-fetch";
import { randomUUID } from "crypto";

const HOST = `http://localhost:${PORT}`;

const app: express.Application = express();
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
};
app.use(errorHandler);
app.use(express.json());
// https://cds-hooks.org/quickstart/

app.get("cds-services", cdsServicesHandler);
app.post("cds-services/ocean-order-sign", orderSignHookHandler);

app.listen(PORT, () => {
  logger.info(`CDS services server is listening at ${HOST}`);
});

async function testGetServices() {
  logger.info("Requesting cds-services");
  // https://cds-hooks.org/specification/current/
  const result = await fetch(`${HOST}/cds-services`, {
    method: "GET",
  });
  logger.info(result);
  logger.info(await result.text());
}

async function testOrderSign() {
  // https://cds-hooks.org/specification/current/
  const uuid = randomUUID();
  const context = {
    patientId: "123",
    questionnaireResponseId: "456",
    userPractitionerId: "789",
    userPractitionerRoleId: "abc",
  };
  const result = await fetch(
    `${HOST}/cds-services/${OCEAN_EORDER_DECISION_SUPPORT_ID}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        hook: "order-sign",
        hookInstance: uuid,
        context: context,
        prefetch: {
          patient: {
            resourceType: "Patient",
            id: context.patientId,
          },
          questionnaireResponse: {
            resourceType: "QuestionnaireResponse",
            id: context.questionnaireResponseId,
          },
          userPractitioner: {
            resourceType: "Practitioner",
            id: context.userPractitionerId,
          },
          userPractitionerRole: {
            resourceType: "PractitionerRole",
            id: context.userPractitionerRoleId,
          },
        },
      }),
    }
  );
  logger.info(result);
  logger.info(await result.text());
}
testGetServices();
testOrderSign();

export default app;
