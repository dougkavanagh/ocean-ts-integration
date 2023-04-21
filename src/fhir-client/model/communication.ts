import { fhirR4 } from "@smile-cdr/fhirts";
import { id } from "./service-request";

export function createCommunication({
  serviceRequestId,
}: {
  serviceRequestId: string;
}): fhirR4.Communication {
  return {
    resourceType: "Communication",
    id: id(),
  };
}
