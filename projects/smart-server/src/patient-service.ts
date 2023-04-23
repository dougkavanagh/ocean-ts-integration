import { fhirR4 } from "@smile-cdr/fhirts";
import { SessionContext } from "./auth-utils";

async function loadPatient(
  context: SessionContext,
  patientId: string
): Promise<fhirR4.Patient> {
  const patient: fhirR4.Patient = {
    resourceType: "Patient",
    id: patientId,
    name: [
      {
        family: "Doe",
        given: ["John"],
      },
    ],
  };
  if (!context || context.user?.siteId !== "1234") {
    throw new Error(
      `This site ${context.user?.siteId} does not have access to this patient resource`
    );
  }
  return patient;
}

export const PatientService = {
  loadPatient,
};
