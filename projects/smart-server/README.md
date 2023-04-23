## SMART Test Server

This project is a reference implementation for a SMART launch server (EHR/EMR).
The server in this project is intended to act as the OIDC/SMART-compatible EMR/EHR launching Ocean, as described in the documentation guide:
[Ocean SMART App Launch Overview](<[https://](https://support.cognisantmd.com/hc/en-us/articles/360057458272-Ocean-SMART-App-Launch-SMART-on-FHIR-EHR-Contextual-Launch-)>)

Building a SMART server is complicated, especially one that supports OIDC for single sign-on. This project aims to demystify the process by providing a reference implementation that can be used as a starting point for your own SMART server. It is not intended to be a production-ready server, but rather a starting point for your own implementation.

This SMART server example may also be useful for testing a SMART client app that relies on OIDC for single sign-on from the EMR.

This project is inspired by the official [SMART on FHIR Launch Server](https://github.com/smart-on-fhir/smart-launcher) project, which is a Javascript reference implementation. However, this project expands on the official project by providing:

- a simplified TypeScript implementation which the author believes is easier to understand and modify.
- a parallel smart-client implementation for testing end-to-end OIDC-based single sign-on.
- Ocean-specific configuration considerations
- A limited reference implementation of relevant FHIR endpoints (Patient, $everything, etc.)

## Getting Started

Due to the public/private encryption requirements of OIDC, you will need to generate a private key and public key for the OIDC server. The private key will be used to sign the JWT tokens. The public key will be used by external clients to verify the JWT. You'll also need a separate, SESSION_SECRET key for symmetric encryption of other JWT tokens.

Create a ".env" file in this folder (the project root):

PORT=9500
SESSION_SECRET=YOUR_SESSION_SECRET_KEY (used for private symmetric JWT encryption by the server)
OIDC_PUBLIC_KEY_BASE64=YOUR_OIDC_PUBLIC_KEY_ENCODED_IN_BASE64 ( e.g., LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUEwTjIrUGhhd2NscEo1ZG90WkRHNAo0TkFJR1ZkUUVIQ2V2UFdFekpLWUNDeThLU0V5dGpSemhVaXN1YkV3ODdFVkJLNzB2VzJBMUNMdmtrakFUcWpuCkh5bWJqS2w5K3ZIblZQazlkZDlJbmNWQUJXVHJQc0J1bDhvTmhXZFV6THZxY093RTd6M3MxUDhDWDBQb3d1b0IKUlAzQ25EUlMzZFZPZnBuRWRtSnNwSWc4c24vdjYxbnlONWVZRE5icFZ3M2Y0K085UWczWlp0bGE1dEdYem51bgorT1BrYlRWK3BVL1VaOCtHbTNIZ3JlQ3Y4S0RVZEE3V3BHdzUyOE1EOStFRE5kV0dwN0RFNjloclRWZVhZdjU2Ckt4aVJCcCtEZ3JRUkRCbUVtaHRRSThET0tha05UdHpPbXIrdDQyNjVra2x2ZnBpdkhpRFNOak9LcnBtaUxMMS8KVndJREFRQUIKLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tCg== )

OIDC_PRIVATE_KEY_BASE64=YOUR_OIDC_PRIVATE_KEY_ENCODED_IN_BASE64

OIDC_KID=YOUR_OIDC_KID ( e.g., n42m3ljfidlnm43290f3021 )

ALLOWED_CLIENT_ID=smart-client-sample-client-id
ALLOWED_CLIENT_SECRET=smart-client-sample-client-secret

### OIDC Keys generation

Run npm run cert to generate a private key and public key for the OIDC server. The private key will be saved to the file "private-key.pem" and the public key will be saved to the file "public-key.pem". Copy the contents of these files into the ".env" file.

The OIDC_KID value is typically derived from the JWK representation of the public key. The exact method of deriving the Kid value can vary, but one common approach is to use a hash function (such as SHA-256) to hash the JWK representation of the public key, and then use the resulting hash as the Kid value.

### Running the SMART server

To run it, use the "smart-server" target in the VS Code debugger, or run "npm run smart-server" in the command line or use the launch.json's "src/smart-server/src/main.ts" target in the VS Code debugger. This will start the SMART server on the specified port.

The SMART server will start up and then pretend as if it is an EHR/EMR that has just launched the SMART app. Imagine a signed-in user who has just clicked a "Launch Ocean" button in a patient chart. The SMART server generates the URL that would be supplied to the web browser to open the SMART client. To test it out, open the URL in a web browser and ensure it points to a live, accessible SMART client app server (such as the smart-client project in this repo).

### Testing with ngrok

https://ngrok.com/

Then, run ngrok with the following command:

ngrok http YOUR_PORT

This will create a temporary public HTTPS URL for your SMART server. Copy and paste the HTTPS URL into the "Webhook Endpoint - Request URL" field in Ocean Admin Portal.
