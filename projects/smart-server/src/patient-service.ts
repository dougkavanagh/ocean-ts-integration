import { fhirR4 } from "@smile-cdr/fhirts";
import { SessionContext } from "./auth-utils";

async function loadPatient(
  context: SessionContext,
  patientId: string
): Promise<fhirR4.Patient> {
  const patient: fhirR4.Patient = {
    resourceType: "Patient",
    id: patientId,
    identifier: [
      {
        use: "official",
        type: {
          coding: [
            {
              system: "http://hl7.org/fhir/v2/0203",
              code: "JHN",
            },
          ],
          text: "Ontario",
        },
        // note the province code varies within the system here:
        // on, ab, bc, mb, nb, nl, ns, nt, nu, pe, qc, sk, yt
        system:
          "https://fhir.infoway-inforoute.ca/NamingSystem/ca-on-patient-hcn",
        value: "4326578901",
        period: {
          start: new Date("2015-01-28"),
          end: new Date("2020-01-28"),
        },
        extension: [
          {
            url: "http://ehealthontario.ca/fhir/StructureDefinition/ext-id-health-card-version-code",
            valueString: "JR",
          },
        ],
      },
      {
        use: "official",
        type: {
          text: "MRN",
        },
        value: patientId,
      },
      // add alternate identifiers e.g. student number, chart number etc.
    ],
    active: true,
    name: [
      {
        use: "official",
        text: "Brian T.Jones",
        family: "Jones",
        given: ["Brian", "Gordon"],
        prefix: ["Dr."],
        suffix: ["BSc", "MD", "CSC"],
      },
    ],
    telecom: [
      {
        system: "phone",
        value: "4162581479",
        use: "home",
        rank: 1,
      },
      {
        system: "phone",
        value: "41655556474",
        use: "mobile",
        rank: 2,
      },
      {
        system: "phone",
        value: "41655556475 x 123",
        use: "work",
        rank: 3,
      },
      {
        system: "email",
        value: "test123@oceanmd.com",
        use: "home",
        rank: 4,
      },
    ],
    gender: "male",
    birthDate: "1974-12-25",
    address: [
      {
        use: "home",
        type: "both",
        line: ["120 Yonge St", "Unit 123"],
        city: "Barrie",
        state: "ON",
        postalCode: "L2W 3R4",
        country: "CAN",
      },
      {
        use: "work",
        type: "physical",
        line: ["134 Yonge St"],
        city: "Toronto",
        state: "ON",
        postalCode: "M1S 3R4",
        country: "CAN",
      },
    ],
    maritalStatus: {
      coding: [
        {
          system: "http://hl7.org/fhir/ValueSet/marital-status",
          code: "M",
        },
      ],
    },
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                code: "C",
                display: "Emergency Contact",
              },
            ],
          },
        ],
        name: {
          family: "du March",
          given: ["Bndicte"],
        },
        telecom: [
          {
            system: "phone",
            value: "4162581479",
            use: "home",
            rank: 1,
          },
        ],
        address: {
          use: "home",
          type: "postal",
          line: ["120 Yonge St"],
          city: "Barrie",
          state: "ON",
          postalCode: "L2W 3R4",
          country: "CAN",
        },
      },
      {
        relationship: [
          {
            coding: [
              {
                code: "SDM",
                display: "Substitute Decision Maker",
              },
            ],
          },
        ],
        name: {
          family: "du March",
          given: ["Bndicte"],
        },
        telecom: [
          {
            system: "phone",
            value: "4162581479",
            use: "home",
            rank: 1,
          },
        ],
        address: {
          use: "home",
          type: "postal",
          line: ["120 Yonge St"],
          city: "Barrie",
          state: "ON",
          postalCode: "L2W 3R4",
          country: "CAN",
        },
      },
    ],
    communication: [
      {
        language: {
          coding: [
            {
              system:
                "https://www.iso.org/obp/ui/#iso:std:iso:639:-3:ed-1:v1:en",
              code: "eng",
              display: "English",
            },
          ],
        },
        preferred: true,
      },
      {
        language: {
          coding: [
            {
              system:
                "https://www.iso.org/obp/ui/#iso:std:iso:639:-3:ed-1:v1:en",
              code: "fra",
              display: "French",
            },
          ],
        },
      },
    ],
    generalPractitioner: [
      {
        reference: "PractitionerRole/52430144-3d5f-4492-bfc0-37124676704d",
      },
    ],
    deceasedBoolean: false,
    deceasedDateTime: undefined,
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
