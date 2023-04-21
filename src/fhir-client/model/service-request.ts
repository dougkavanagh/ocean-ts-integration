import { fhirR4 } from "@smile-cdr/fhirts";
import { nanoid } from "nanoid";

export type MessageType =
  | "notify-update-appointment"
  | "notify-update-status"
  | "send-communication-from-provider"
  | "send-communication-from-requester";

export function id(): string {
  return nanoid();
}
export function createServiceRequest(args: {
  ref: string;
  patient: fhirR4.Patient;
}): fhirR4.ServiceRequest {
  return {
    resourceType: "ServiceRequest",
    id: args.ref,
    meta: {
      profile: [
        "http://ehealthontario.ca/fhir/StructureDefinition/ca-on-eReferral-profile-ServiceRequest|1.0.0",
      ],
    },
    identifier: [
      {
        system:
          "http://localhost:8080/svc/fhir/v1/NamingSystem/id-ereferral-reference",
        value: args.ref,
      },
    ],
    status: "active",
    intent: "proposal",
    category: [
      {
        coding: [
          {
            system: "http://snomed.info/sct",
            code: "310125001",
            display: "RADIOLOGY",
          },
        ],
      },
      {
        coding: [
          {
            system: "http://loinc.org",
            code: "75490-3",
            display: "RADIOLOGY",
          },
        ],
      },
    ],
    priority: "routine",
    orderDetail: [
      {
        coding: [
          {
            display: "Radiology",
          },
        ],
      },
    ],
    subject: {
      reference: "Patient/" + args.patient.id,
    },
    authoredOn: new Date("2021-02-25T16:38:31-05:00"),
    requester: {
      reference: "PractitionerRole/64081fcc-a826-41b9-8243-8427758d7bf1",
    },
    supportingInfo: [
      {
        reference: "QuestionnaireResponse/2c696ce4-5665-4af0-b8fe-3f982e7b2185",
      },
      {
        reference: "DocumentReference/2440a55e-9c53-4925-8843-4ba670e1cb32",
      },
    ],
    note: [
      {
        authorReference: {
          reference: "Practitioner/54ad0ded-67e8-4867-b037-f1ef765f9748",
        },
        time: new Date("2021-02-25T16:38:31-05:00"),
        text: "<b>Reason for Referral:</b> Needs a CT on leg<br><b>History: </b>Multiple Injuries&nbsp;",
      },
    ],
  };
}

export function createPractitionerRole(
  practitioner: fhirR4.Practitioner
): fhirR4.PractitionerRole {
  return {
    resourceType: "PractitionerRole",
    id: "64081fcc-a826-41b9-8243-8427758d7bf1",
    meta: {
      profile: [
        "http://ehealthontario.ca/fhir/StructureDefinition/ca-on-eReferral-profile-PractitionerRole|1.0.0",
      ],
    },
    identifier: [
      {
        use: "official",
        type: {
          coding: [
            {
              system: "http://hl7.org/fhir/v2/0203",
              code: "LN",
              display: "License Number",
            },
          ],
        },
        system:
          "http://infoway-inforoute.ca/fhir/NamingSystem/ca-on-license-physician",
        value: "7654321",
      },
    ],
    active: true,
    practitioner: {
      reference: "Practitioner/" + practitioner.id,
    },
    code: [
      {
        coding: [
          {
            system: "http://snomed.info/sct",
            code: "59058001",
            display: "Family Physician",
          },
        ],
      },
    ],
    location: [
      {
        reference: "Location/a6a476de-67ee-4f63-bb40-054617e7594f",
      },
    ],
    telecom: [
      {
        system: "phone",
        value: "123-456-7890",
        use: "work",
      },
      {
        system: "fax",
        value: "123-456-7890",
        use: "work",
      },
      {
        system: "email",
        value: "fake@email.com",
        use: "work",
      },
    ],
  };
}

export function createPractitioner(): fhirR4.Practitioner {
  return {
    resourceType: "Practitioner",
    id: "54ad0ded-67e8-4867-b037-f1ef765f9748",
    meta: {
      profile: [
        "http://ehealthontario.ca/fhir/StructureDefinition/ca-on-eReferral-profile-Practitioner|1.0.0",
      ],
    },
    identifier: [
      {
        use: "official",
        type: {
          coding: [
            {
              system: "http://hl7.org/fhir/v2/0203",
              code: "LN",
              display: "License Number",
            },
          ],
        },
        system:
          "http://infoway-inforoute.ca/fhir/NamingSystem/ca-on-license-physician",
        value: "7654321",
      },
      {
        system:
          "http://localhost:8080/svc/fhir/v1/NamingSystem/id-practitioner-username",
        value: "username",
      },
    ],
    active: true,
    name: [
      {
        family: "Doctor",
        given: ["Test"],
      },
    ],
    telecom: [
      {
        system: "phone",
        value: "123-456-7890",
        use: "work",
      },
      {
        system: "fax",
        value: "123-456-7890",
        use: "work",
      },
      {
        system: "email",
        value: "fake@email.com",
        use: "work",
      },
    ],
    address: [
      {
        use: "work",
        type: "both",
        line: ["123 Any St"],
        city: "Some City",
        state: "ON",
        postalCode: "A1B 2C3",
      },
    ],
  };
}

export function createLocation(): fhirR4.Location {
  return {
    resourceType: "Location",
    id: "a6a476de-67ee-4f63-bb40-054617e7594f",
    meta: {
      profile: [
        "http://ehealthontario.ca/fhir/StructureDefinition/ca-on-eReferral-profile-Location|1.0.0",
      ],
    },
    status: "active",
    mode: "instance",
    telecom: [
      {
        system: "phone",
        value: "123-456-7890",
        use: "work",
      },
      {
        system: "fax",
        value: "123-456-7890",
        use: "work",
      },
      {
        system: "email",
        value: "fake@email.com",
        use: "work",
      },
    ],
    address: {
      use: "work",
      type: "physical",
      line: ["123 Any St"],
      city: "Some City",
      state: "ON",
      postalCode: "A1B 2C3",
    },
  };
}

export function createPatient({
  patientId,
}: {
  patientId?: string;
}): fhirR4.Patient {
  return {
    resourceType: "Patient",
    id: patientId ?? id(),
    meta: {
      profile: [
        "http://ehealthontario.ca/fhir/StructureDefinition/ca-on-eReferral-profile-Patient|1.0.0",
      ],
    },
    extension: [
      {
        url: "http://ehealthontario.ca/fhir/StructureDefinition/ext-id-health-card-version-code",
        valueString: "AB",
      },
    ],
    identifier: [
      {
        use: "official",
        type: {
          coding: [
            {
              system: "http://hl7.org/fhir/v2/0203",
              code: "JHN",
              display: "Jurisdictional health number (Canada)",
            },
          ],
        },
        system:
          "https://fhir.infoway-inforoute.ca/NamingSystem/ca-on-patient-hcn",
        value: "1467870157",
      },
      {
        system: "http://localhost:8080/svc/fhir/v1/NamingSystem/id-site-number",
        value: "1234",
      },
      {
        type: {
          coding: [
            {
              system: "http://hl7.org/fhir/v2/0203",
              code: "MR",
              display: "Medical record number",
            },
          ],
        },
        system:
          "http://localhost:8080/svc/fhir/v1/NamingSystem/id-external-patient-reference",
        value: "123456",
      },
    ],
    active: true,
    name: [
      {
        use: "official",
        text: "Test Patient",
        family: "Patient",
        given: ["Test"],
      },
    ],
    gender: "female",
    birthDate: "2000-01-13",
    deceasedBoolean: false,
    address: [
      {
        use: "home",
        type: "postal",
        line: ["789 Any Street"],
        city: "Other Town",
        state: "ON",
        postalCode: "G7H 8I9",
      },
      {
        use: "home",
        type: "postal",
      },
    ],
  };
}

export function createQuestionnaireResponse(): fhirR4.QuestionnaireResponse {
  return {
    resourceType: "QuestionnaireResponse",
    id: "2c696ce4-5665-4af0-b8fe-3f982e7b2185",
    meta: {
      profile: [
        "http://ehealthontario.ca/fhir/StructureDefinition/ca-on-eReferral-profile-QuestionnaireResponse|1.0.0",
      ],
    },
    identifier: {
      system:
        "http://localhost:8080/svc/fhir/v1/NamingSystem/id-form-reference",
      value: "quickReferral",
    },
    status: "completed",
    subject: {
      reference: "Patient/6f3e3923-8332-44bc-8482-b6bbc9778c80",
    },
    author: {
      reference: "Practitioner/095e3576-2a93-460a-b3be-bcb6e6f6d965",
    },
    item: [
      {
        linkId: "__section",
      },
      {
        linkId: "s",
      },
      {
        linkId: "reason_for_referral",
      },
      {
        linkId: "rfr",
        answer: [
          {
            valueString: "MRI needed on Ankle.",
          },
        ],
      },
      {
        linkId: "history",
      },
      {
        linkId: "hx",
        answer: [
          {
            valueString: "History of sport related ankle injuries.",
          },
        ],
      },
      {
        linkId: "includeCPP",
      },
      {
        linkId: "s__section",
      },
      {
        linkId: "i_ncurrent_problems_n",
      },
      {
        linkId: "prob",
      },
      {
        linkId: "i_npast_medical_histo",
      },
      {
        linkId: "pmhx",
      },
      {
        linkId: "i_nfamily_history_n",
      },
      {
        linkId: "fhx",
      },
      {
        linkId: "i_nmedications_n",
      },
      {
        linkId: "rx",
      },
      {
        linkId: "allergies",
      },
      {
        linkId: "allg",
      },
      {
        linkId: "i_ntreatments_n",
      },
      {
        linkId: "tx",
      },
      {
        linkId: "i_nsocial_history_n",
      },
      {
        linkId: "soc",
      },
      {
        linkId: "includeLabs",
      },
      {
        linkId: "labs2",
      },
      {
        linkId: "labs",
      },
      {
        linkId: "fx_test1",
      },
      {
        linkId: "fx_two",
      },
    ],
  };
}

export function createDocumentReference(): fhirR4.DocumentReference {
  return {
    resourceType: "DocumentReference",
    id: "2440a55e-9c53-4925-8843-4ba670e1cb32",
    meta: {
      profile: [
        "http://ehealthontario.ca/fhir/StructureDefinition/ca-on-eReferral-profile-DocumentReference|1.0.0",
      ],
    },
    identifier: [
      {
        system:
          "http://localhost:8080/svc/fhir/v1/NamingSystem/id-attachment-reference",
        value: "2440a55e-9c53-4925-8843-4ba670e1cb32",
      },
    ],
    status: "current",
    date: "2021-02-25T16:38:30.714-05:00",
    content: [
      {
        attachment: {
          contentType: "application/pdf",
          url: "http://localhost:8080/svc/fhir/v1/DocumentReference/2440a55e-9c53-4925-8843-4ba670e1cb32/$binary",
          size: 807626,
          title: "d99800004.pdf",
          creation: new Date("2021-02-25T16:38:30-05:00"),
        },
      },
    ],
  };
}

export function createAppointment({
  appointmentId,
  appointmentLabel,
  serviceRequestId,
  patientId,
  start,
  end,
  appointmentStatus,
  waitTimeType,
  patientInstruction,
}: {
  appointmentId?: string;
  serviceRequestId: string;
  appointmentLabel: string;
  patientId: string;
  start: Date;
  end: Date;
  appointmentStatus: "tentative" | "accepted";
  waitTimeType?: "wait-1" | "wait-2" | "wait-1a" | "wait-1b";
  patientInstruction?: string; // Ocean booking comments
}): fhirR4.Appointment {
  return {
    resourceType: "Appointment",
    id: appointmentId ?? id(),
    meta: {
      profile: [
        "http://ehealthontario.ca/fhir/StructureDefinition/ca-on-eReferral-profile-Appointment|1.0.0",
      ],
    },
    extension: waitTimeType
      ? [
          {
            url: "https://ocean.cognisantmd.com/svc/fhir/v1/StructureDefinition/ext-ontario-clinical-wait-time-appointment-milestones",
            valueCoding: {
              system:
                "http://ocean.cognisantmd.com/svc/fhir/v1/CodeSystem/ontario-clinical-wait-time-codes",
              code: waitTimeType,
              display: waitTimeType,
            },
          },
        ]
      : [],
    appointmentType: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/v2-0276",
          code: "ROUTINE",
        },
      ],
      text: appointmentLabel,
    },
    description: "Appointment",
    start: start.toISOString(),
    end: end.toISOString(),
    minutesDuration: (end.getTime() - start.getTime()) / 60000,
    basedOn: [
      {
        reference: "ServiceRequest/" + serviceRequestId,
      },
    ],
    participant: [
      {
        actor: {
          reference: "Patient/" + patientId,
        },
        required: "required",
        status: appointmentStatus,
        type: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/v2-0276",
                code: "LOC",
              },
            ],
          },
        ],
      },
    ],
    patientInstruction: patientInstruction,
  };
}

export function createMessageHeader({
  msgType,
  focus,
  serviceRequestId,
}: {
  msgType: MessageType;
  serviceRequestId: string;
  focus: fhirR4.Reference[];
}): fhirR4.MessageHeader {
  return {
    resourceType: "MessageHeader",
    id: "5c72c0d1-2044-4ca2-b981-a8eda0e12789",
    meta: {
      profile: [
        "http://ehealthontario.ca/fhir/StructureDefinition/ca-on-eReferral-profile-MessageHeader|1.0.0",
      ],
    },
    extension: [
      {
        url: "http://ehealthontario.ca/fhir/StructureDefinition/ext-id-message-header",
        valueString: serviceRequestId,
      },
    ],
    eventCoding: {
      system: "https://ehealthontario.ca/fhir/CodeSystem/message-event-code",
      code: msgType,
      display: msgType,
    },
    destination: [
      {
        name: "Ocean",
        endpoint: "http://localhost:8080/svc/fhir/v1/$process-messsages",
        receiver: {
          reference: "PractitionerRole/sample_listing-82464989",
        },
      },
    ],
    sender: {
      reference: "Organization/sample-organization",
    },
    author: {
      reference: "PractitionerRole/64081fcc-a826-41b9-8243-8427758d7bf1",
    },
    source: {
      name: "Source System",
      endpoint: "https://sample.system.com/svc/fhir/v1/$process-messages",
    },
    focus,
  };
}

export function createMessageBundle({
  resources,
}: {
  resources: fhirR4.Resource[];
}): fhirR4.Bundle {
  return {
    resourceType: "Bundle",
    type: "message",
    entry: resources.map((r) => {
      return { resource: r };
    }),
  };
}
