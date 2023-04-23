import { fhirR4 } from "@smile-cdr/fhirts";
import { id } from "./service-request";

export function createTask({
  serviceRequestId,
  status,
  extension,
}: {
  serviceRequestId: string;
  status: "accepted" | "completed";
  extension?: fhirR4.Task["extension"];
}): fhirR4.Task {
  return {
    resourceType: "Task",
    id: id(),
    identifier: [
      {
        use: "official",
        system: "http:/goodhealth.org/identifiers",
        value: "20170201-001",
      },
    ],
    basedOn: [
      {
        reference: "ServiceRequest/" + serviceRequestId,
      },
    ],
    status,
    businessStatus: {
      coding: [
        {
          system:
            "https://ehealthontario.ca/fhir/CodeSystem/task-business-status",
          code: "NW",
          display: "New",
        },
      ],
    },
    intent: "plan",
    code: {
      coding: [
        {
          system: "http://hl7.org/fhir/CodeSystem/task-code",
          code: "approve",
          display: "Activate/approve the focal resource",
        },
      ],
    },
    executionPeriod: {
      start: new Date("2016-10-31T08:25:05+10:00"),
    },
    authoredOn: new Date("2016-10-31T08:25:05+10:00"),
    lastModified: new Date("2016-11-30T08:25:05+10:00"),
    owner: {
      reference: "PractitionerRole/sample_listing-82464989",
    },
    extension,
  };
}
