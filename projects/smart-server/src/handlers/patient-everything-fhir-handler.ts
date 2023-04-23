import { fhirR4 } from "@smile-cdr/fhirts";
import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router,
} from "express";
import { SessionContext } from "../auth-utils";
import { PatientService } from "../patient-service";

const getHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const context = req.context;
  if (!context) {
    return next(new Error("No security context"));
  }
  const patientId = req.params.id;
  const resourceTypesToInclude = req.params._type?.split(",") ?? [];
  const resources: fhirR4.Resource[] = await loadPatientResources(
    context,
    patientId,
    resourceTypesToInclude
  );
  const bundle: fhirR4.Bundle = {
    resourceType: "Bundle",
    entry: resources.map((resource) => {
      return {
        resource,
      };
    }),
  };
  res.status(200).json(bundle);
};

async function loadPatientResources(
  context: SessionContext,
  patientId: string,
  resourceTypesToInclude?: string[]
): Promise<fhirR4.Resource[]> {
  const resources: fhirR4.Resource[] = [];
  if (!resourceTypesToInclude || resourceTypesToInclude.includes("Patient")) {
    resources.push(await PatientService.loadPatient(context, patientId));
  }
  return resources;
}

function setup(router: Router) {
  router.get("/Patient/:id/([$])everything", getHandler);
}

export const PatientEverythingFhirHandler = {
  setup,
};
