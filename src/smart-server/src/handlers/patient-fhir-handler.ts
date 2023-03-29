import { fhirR4 } from "@smile-cdr/fhirts";
import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router,
} from "express";
import { PatientEverythingFhirHandler } from "./patient-everything-fhir-handler";
import { ErrorMessage, isErrorMessage } from "../core";

const getHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const result = await handleQuery(req);
  if (isErrorMessage(result)) {
    res.status(result.httpCode || 400).send(result);
    return;
  } else {
    res.status(200).json(result);
  }
};

async function handleQuery(
  req: Request
): Promise<fhirR4.Patient | fhirR4.Bundle | ErrorMessage> {
  const query = req.query;
  const id = req.params.id;
  if (id) {
    const pt: fhirR4.Patient = {
      resourceType: "Patient",
      // ...
    };
    if (!pt) {
      return new ErrorMessage({ httpCode: 404, message: "Patient not found" });
    }
    return pt;
  }
  if (query.identifier) {
    // const idParam = parseIdentifierParam(query.identifier);
    // const pts = await PatientService.findByIdSystemCodeAndValue({
    //   context,
    //   ...idParam,
    // });
    // return searchBundle(pts.map(patientToFhir));
  }
  return new ErrorMessage({ httpCode: 400, message: "Invalid query" });
}

function setup(router: Router) {
  PatientEverythingFhirHandler.setup(router);
  router.get("/Patient/:id", getHandler);
  router.get("/Patient", getHandler);
}

export const PatientFhirHandler = {
  setup,
};
