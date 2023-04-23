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
import { PatientService } from "../patient-service";
import { parseIdentifierParam } from "../fhir-utils";

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
  const context = req.context;
  if (!context) {
    return new ErrorMessage({ httpCode: 401, message: "No security context" });
  }
  if (id) {
    const pt: fhirR4.Patient = await PatientService.loadPatient(context, id);
    if (!pt) {
      return new ErrorMessage({ httpCode: 404, message: "Patient not found" });
    }
    return pt;
  }
  if (query.identifier) {
    // TBI: you may want to handle other search queries for the Patient endpoint, especially the identifier query for JHN (HNs)
    const idParam = parseIdentifierParam(query.identifier);
    /* e.g. 
    const pts = await PatientService.findByIdSystemCodeAndValue({
      context,
      ...idParam,
     });
    return createSearchBundle(pts.map(patientToFhir));
    */
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
