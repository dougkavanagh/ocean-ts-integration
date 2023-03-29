import { fhirR4 } from "@smile-cdr/fhirts";
import { NextFunction, Request, RequestHandler, Response, Router } from "express";

const getHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const patientId = req.params.id;
  const resourceTypesToInclude = req.params._type
  const resources: fhirR4.Resource[] = [];
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

function setup(router: Router) {
  router.get("/Patient/:id/([$])everything", getHandler);
}

export const PatientEverythingFhirHandler = {
  setup,
};
