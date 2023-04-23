import { fhirR4 } from "@smile-cdr/fhirts";

export function schedule1(): fhirR4.Schedule {
  return {
    resourceType: "Schedule",
    id: "Schedule-eg",
    active: true,
    serviceCategory: [
      {
        coding: [
          {
            system: "http://hl7.org/fhir/ValueSet/service-category",
            code: "17",
            display: "General Practice",
          },
        ],
      },
    ],
    serviceType: [
      {
        coding: [
          {
            system: "http://hl7.org/fhir/ValueSet/service-type",
            code: "124",
            display: "General Practice",
          },
        ],
      },
    ],
    actor: [
      {
        reference: "Practitioner/12345",
        display: "Dr. Anne Gable - Family Practice (Primary Schedule Name)",
      },
    ],
  };
}
