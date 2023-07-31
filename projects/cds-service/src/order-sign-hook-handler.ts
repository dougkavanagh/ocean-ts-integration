import { NextFunction, Request, RequestHandler, Response } from "express";
import logger from "./logger";

// https://cds-hooks.org/cheat-sheet/Cheat%20Sheet%20-%20Sept%202019.pdf

export const orderSignHookHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    logger.info(`hook-handler`);
    const body = req.body;

    res.status(200).json({
      cards: [
        // https://cds-hooks.hl7.org/2.0/#card-attributes
        {
          uuid: Math.random().toString(), // use proper uuids in production
          indicator: "critical",
          summary:
            "One-sentence, <140-character summary message for display to the user inside of this card.",
          detail: "Markdown: This is an example of a validation failure.",
          suggestions: [
            // https://cds-hooks.hl7.org/2.0/#suggestion
            {
              label: "Suggestion 1",
              uuid: Math.random().toString(),
              // https://cds-hooks.hl7.org/2.0/#action
              actions: [],
            },
          ],
          source: {
            label: "Zika Virus Management",
            url: "https://example.com/cdc-zika-virus-mgmt",
            icon: "https://example.com/cdc-zika-virus-mgmt/100.png",
            topic: {
              system: "http://example.org/cds-services/fhir/CodeSystem/topics",
              code: "12345",
              display: "Mosquito born virus",
            },
          },
          overrideReasons: [
            {
              code: "reason-code-provided-by-service",
              system:
                "http://example.org/cds-services/fhir/CodeSystem/override-reasons",
              display: "Clinician refused",
            },
          ],
          links: [
            {
              label: "(Description of the issue on the order form)",
              url: "https://smart.example.com/launch",
              type: "absolute",
            },
          ],
        },
      ],
    });
    // TODO add /feedback handler https://cds-hooks.hl7.org/2.0/#feedback
  } catch (e: unknown) {
    next(e);
  }
};
