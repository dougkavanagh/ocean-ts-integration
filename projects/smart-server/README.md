## SMART Test Server

This project is a reference implementation for a SMART launch server (EHR/EMR).
The server in this project is intended to act as the OIDC/SMART-compatible EMR/EHR launching Ocean, as described in the documentation guide:
[Ocean SMART App Launch Overview](https://support.cognisantmd.com/hc/en-us/articles/360057458272-Ocean-SMART-App-Launch-Overview-SMART-on-FHIR-EHR-Contextual-Launch-).

Building a SMART server is complicated, especially one that supports OIDC for single sign-on. In addition to FHIR endpoints for patient resources, additional endpoints are required to support OAuth2 and the [OIDC identity validation](https://openid.net/specs/openid-connect-core-1_0.html). This project aims to demystify the process by providing an end-to-end reference implementation that can be used as a starting point for your own SMART server. It is not intended to be a production-ready server, but rather a starting point for your own implementation.

This SMART server example may also be useful for testing a SMART client app that relies on OIDC for single sign-on from the EMR.

This project is inspired by the official [SMART on FHIR Launch Server](https://github.com/smart-on-fhir/smart-launcher) project, which is a Javascript reference implementation. However, this project expands on the official project by providing:

- a simplified TypeScript implementation
- a parallel smart-client implementation for testing end-to-end OIDC-based single sign-on.
- Ocean-specific configuration considerations
- a limited reference implementation of relevant FHIR endpoints (Patient, $everything, etc.)
- support for serverless (just wrap the main.ts express code in a function handler)

## Overview

The main.ts file sets up listeners for the following endpoints necessary to support a basic SSO SMART launch:

| Endpoint                               | Description                                                                                                                         |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| /auth/authorize                        | OAuth2 authorization endpoint. This is the endpoint that the SMART client will call to initiate the OAuth2 authorization flow.      |
| /auth/token                            | OAuth2 token endpoint. This is the endpoint that the SMART client will call to exchange the authorization code for an access token. |
| /auth/keys                             | OIDC endpoint for retrieving the public key used to sign the JWT tokens                                                             |
| /fhir/.well-known/openid-configuration | OIDC endpoint for retrieving the OIDC configuration                                                                                 |
| /fhir/.well-known/smart-configuration  | SMART endpoint for retrieving the SMART configuration                                                                               |
| /fhir/Patient/[id]                     | FHIR endpoint for retrieving a Patient resource by patient ID                                                                       |
| /fhir/Patient/[id]/$everything         | FHIR endpoint for retrieving a Bundle resource containing the Patient and all related resources by patient ID.                      |

## Getting Started

Due to the public/private encryption requirements of OIDC, you will need to generate a private key and public key for the OIDC server. The private key will be used to sign the JWT tokens. The public key will be used by external clients to verify the JWT. You'll also need a separate, SESSION_SECRET key for symmetric encryption of other JWT tokens.

Create a ".env" file in this folder (the project root):

`PORT=9500
SESSION_SECRET=YOUR_SESSION_SECRET_KEY
OIDC_PUBLIC_KEY_BASE64=YOUR_OIDC_PUBLIC_KEY_ENCODED_IN_BASE64
OIDC_PRIVATE_KEY_BASE64=YOUR_OIDC_PRIVATE_KEY_ENCODED_IN_BASE64
OIDC_KID=YOUR_OIDC_KID
ALLOWED_CLIENT_ID=smart-client-sample-client-id
ALLOWED_CLIENT_SECRET=smart-client-sample-client-secret`

For SESSION_SECRET, use any UUID-like private string.

### OIDC Keys generation

Run `npm run cert` to generate a private key and public key for the OIDC server. The private key will be saved to the file "private-key.pem" and the public key will be saved to the file "public-key.pem". It also encodes them as separate Base64 files. Copy the contents of the public-key-base64.txt into the OIDC_PUBLIC_KEY_BASE64 env var and the contents of the private-key-base64.txt into the OIDC_PRIVATE_KEY_BASE64 env var.

The OIDC_KID value is typically derived from the JWK representation of the public key. The exact method of deriving the Kid value can vary, but one common approach is to use a hash function (such as SHA-256) to hash the JWK representation of the public key, and then use the resulting hash as the Kid value.

### Running the SMART server

Start by running "npm install" in this project directory. Ensure you also have the .env file in this project directory, configured as described above.

To run it, use the "smart-server" target in the VS Code debugger, or run "npm run smart-server" in the command line or use the launch.json's "src/smart-server/src/main.ts" target in the VS Code debugger. This will start the SMART server on the specified port.

The SMART server will start up and then pretend as if it is an EHR/EMR that has just launched the SMART app. Imagine a signed-in user who has just clicked a "Launch Ocean" button in a patient chart. The SMART server generates the URL that would be supplied to the web browser to open the SMART client.

To test it out, open the URL in a web browser and ensure it points to a live, accessible SMART client app server (such as the smart-client project in this repo).

### Testing with ngrok

https://ngrok.com/

Then, run ngrok with the following command:

ngrok http YOUR_PORT

This will create a temporary public HTTPS URL for your SMART server. Copy and paste the HTTPS URL into the "Webhook Endpoint - Request URL" field in Ocean Admin Portal.

### Points of Configuration

There are several areas within this project that a real EMR will want to adapt in particular:

- patient-service.ts - to handle the loading of patient data from the database
- patient-everything-fhir-handler.ts and patient-fhir-handler.ts - to customize the fetching and mapping of patient FHIR resources from the EMR/EHR's database and domain model
- client-service.ts - used to determine which SMART app clients (as determined by client_id and client_secret) are supported by this SMART server.
- authorization-code-service - used to generate and store authorization codes for OAuth2. This is an in-memory reference implementation only.
