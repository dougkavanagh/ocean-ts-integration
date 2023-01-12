import { getOAuthBearerToken, postReferralFhirMessage } from "./fhir-client";
import {
  createAppointment,
  createLocation,
  createMessageBundle,
  createMessageHeader,
  createPatient,
  createPractitioner,
  createPractitionerRole,
  createServiceRequest,
  createTask,
} from "./model/service-request";
import {
  OCEAN_HOST as oceanHost,
  REFERRAL_REF,
  CLIENT_ID as clientId,
  CLIENT_SECRET as clientSecret,
  APPOINTMENT_ID,
} from "../env";
import { Response } from "node-fetch";

export async function testConfirmAppointment() {
  const bearerToken = await oauth2();
  logResult(await confirmAppointment(bearerToken));
}

async function confirmAppointment(bearerToken: string) {
  const ref = REFERRAL_REF;
  const patient = createPatient({});
  const appointment = createAppointment({
    appointmentId: APPOINTMENT_ID,
    appointmentStatus: "accepted",
    serviceRequestId: ref,
    appointmentLabel: "Appointment",
    patientId: patient.id ?? "",
    start: new Date("Aug 20, 2022 11:00:00"),
    end: new Date("Aug 20, 2022 11:30:00"),
  });
  const header = createMessageHeader({
    msgType: "notify-update-appointment",
    focus: [
      {
        reference: "Appointment/" + APPOINTMENT_ID,
      },
    ],
    serviceRequestId: ref,
  });
  const message = createMessageBundle({
    resources: [header, appointment, patient],
  });
  return await postReferralFhirMessage({ bearerToken, message, oceanHost });
}

export async function testCompleteReferral() {
  logResult(await setReferralAsCompleted(await oauth2()));
}

async function setReferralAsCompleted(bearerToken: string) {
  const referralRef = REFERRAL_REF;
  const task = createTask({
    serviceRequestId: referralRef,
    status: "completed",
  });
  const header = createMessageHeader({
    msgType: "notify-update-status",
    focus: [
      {
        reference: "Task/" + task.id,
      },
    ],
    serviceRequestId: referralRef,
  });
  const message = createMessageBundle({
    resources: [header, task],
  });
  return await postReferralFhirMessage({ bearerToken, message, oceanHost });
}

export async function testSetReferralRedirect() {
  logResult(await setReferralRedirect(await oauth2()));
}

async function setReferralRedirect(bearerToken: string) {
  const referralRef = REFERRAL_REF;
  const task = createTask({
    serviceRequestId: referralRef,
    status: "accepted",
    extension: [
      {
        url: "https://ocean.cognisantmd.com/ext-ocean-third-party-redirect-url",
        valueUri: "https://www.google.com",
      }
    ]
  });
  const header = createMessageHeader({
    msgType: "notify-update-status",
    focus: [
      {
        reference: "Task/" + task.id,
      },
    ],
    serviceRequestId: referralRef,
  });
  const message = createMessageBundle({
    resources: [header, task],
  });
  return await postReferralFhirMessage({ bearerToken, message, oceanHost });
}

export async function testUpdateReferralAppointment() {
  logResult(await addAppointment(await oauth2()));
}

async function logResult(res: Response) {
  console.log(res.status);
  console.log(res.statusText);
  try {
    console.log(JSON.stringify(await res.json()));
  } catch (error) {}
}

function oauth2(): string | PromiseLike<string> {
  return getOAuthBearerToken({
    oceanHost,
    clientId,
    clientSecret,
  });
}

async function addAppointment(bearerToken: string) {
  const ref = REFERRAL_REF;
  const patient = createPatient({});
  const appointment = createAppointment({
    appointmentStatus: "tentative",
    serviceRequestId: ref,
    appointmentLabel: "Appointment",
    patientId: patient.id ?? "",
    start: new Date("Aug 20, 2022 11:00:00"),
    end: new Date("Aug 20, 2022 11:30:00"),
  });
  const header = createMessageHeader({
    msgType: "notify-update-appointment",
    focus: [
      {
        reference: "Appointment/" + appointment.id,
      },
    ],
    serviceRequestId: ref,
  });
  const task = createTask({ serviceRequestId: ref, status: "accepted" });
  const location = createLocation();
  const practitioner = createPractitioner();
  const practitionerRole = createPractitionerRole(practitioner);
  const serviceRequest = createServiceRequest({ patient, ref });
  const message = createMessageBundle({
    resources: [
      header,
      appointment,
      task,
      patient,
      location,
      practitioner,
      practitionerRole,
      serviceRequest,
    ],
  });
  return await postReferralFhirMessage({ bearerToken, message, oceanHost });
}
