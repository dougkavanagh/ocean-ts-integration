import { fhirR4 } from "@smile-cdr/fhirts";

export function practitioner1(): fhirR4.Practitioner {
  return {
    resourceType: "Practitioner",
    id: "Practitioner-eg",
    identifier: [],
    active: true,
    name: [
      {
        family: "Gable",
        given: ["Anne"],
        text: "Dr. Anne Gable - Family Practice",
      },
    ],
  };
}
