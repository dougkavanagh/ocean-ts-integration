import { fhirR4 } from "@smile-cdr/fhirts";
import { Bundle } from "@smile-cdr/fhirts/dist/FHIR-R4/classes/bundle";
import { Resource } from "@smile-cdr/fhirts/dist/FHIR-R4/classes/resource";
import { ErrorMessage } from "./core";

export function outcome(
  issue?: fhirR4.OperationOutcomeIssue
): fhirR4.OperationOutcome {
  return {
    resourceType: "OperationOutcome",
    issue: issue ? [issue] : [],
  };
}

export function errorOutcome(error: ErrorMessage): fhirR4.OperationOutcome {
  return {
    resourceType: "OperationOutcome",
    issue: [
      {
        severity: "error",
        code: "exception",
        diagnostics: error.message,
      },
    ],
  };
}

export interface IdentifierCriteria {
  system?: string;
  code?: string;
  value?: string;
}
export function parseIdentifierParam(
  param: any
): IdentifierCriteria | undefined | ErrorMessage {
  const criteria: IdentifierCriteria = {};
  if (!param) {
    return undefined;
  }
  const idAndValueParts = param.split(":");
  if (idAndValueParts.length === 1) {
    criteria.value = param;
    return;
  } else {
    criteria.value = idAndValueParts[1];
  }
  const idPart = idAndValueParts[0];
  if (idPart.contains("|")) {
    const keyParts = idPart.split("|");
    criteria.system = keyParts[0];
    criteria.code = keyParts[1];
  }
  return criteria;
}

export function bundle(
  resources: Resource[],
  bundleType?: Bundle.TypeEnum
): Bundle {
  return {
    resourceType: "Bundle",
    type: bundleType ?? "searchset",
    total: resources.length,
    entry: resources.map((resource) => ({
      resource,
    })),
  };
}

export function getReferencedId({
  reference,
  resourceType,
}: {
  reference?: string;
  resourceType: string;
}): string | null {
  if (!reference?.startsWith(resourceType + "/")) {
    return null;
  }
  return reference.substring(resourceType.length + 1);
}