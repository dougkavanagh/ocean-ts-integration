import { NextFunction, Request, RequestHandler, Response } from "express";
import logger from "./logger";

// https://cds-hooks.hl7.org/2.0/
// https://cds-hooks.org/cheat-sheet/Cheat%20Sheet%20-%20Sept%202019.pdf

// https://fhir-org-cds-services.appspot.com/cds-services
// https://chat.fhir.org/#narrow/stream/179159-cds-hooks

const handler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    logger.info(`cds-services-handler`);
    // this id is shared across both order hooks: https://cds-hooks.hl7.org/2.0/#update-stale-guidance
    const OCEAN_EORDER_DECISION_SUPPORT_ID = "ocean-eorder-decision-support";
    res.status(200).json({
      services: [
        {
          hook: "order-sign",
          title: "Ocean CDS Service order-sign example",
          description:
            "Provides decision support for an Ocean eOrder form immediately prior to submission",
          id: OCEAN_EORDER_DECISION_SUPPORT_ID,
          prefetch: {
            patient: "Patient/{{context.patientId}}",
            questionnaireResponse:
              "QuestionnaireResponse/{{context.questionnaireResponseId}}",
            userPractitioner: "Practitioner/{{context.userPractitionerId}}",
            userPractitionerRole:
              "PractitionerRole/{{context.userPractitionerRoleId}}",
          },
          usageRequirements: "As an example only",
        },
        {
          hook: "order-select",
          id: OCEAN_EORDER_DECISION_SUPPORT_ID,
          title:
            "Provides decision support for an Ocean eOrder form in real time as it is updated",
          description:
            "Produce an appropriateness score according to scenario inputs.",
        },
      ],
    });
  } catch (e: unknown) {
    next(e);
  }
};
export default handler;
