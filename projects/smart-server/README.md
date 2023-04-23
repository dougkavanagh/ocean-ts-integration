## SMART Test Server

This module can be used as a reference implementation for a SMART launch server (EHR/EMR) as if it would
act as the OIDC/SMART-compatible EMR/EHR launching Ocean, as described in the documentation guide:
[Ocean SMART App Launch Overview](<[https://](https://support.cognisantmd.com/hc/en-us/articles/360057458272-Ocean-SMART-App-Launch-SMART-on-FHIR-EHR-Contextual-Launch-)>)

## Getting Started

Create a ".env" file in this folder (the project root):
PORT=9500
SESSION_SECRET=YOUR_SESSION_SECRET
OIDC_PRIVATE_KEY=YOUR_OIDC_PRIVATE_KEY
OIDC_PUBLIC_KEY=YOUR_OIDC_PUBLIC_KEY
OIDC_KID=YOUR_OIDC_KID

To run it, use the "smart-server" target in the VS Code debugger, or run "npm run smart-server" in the command line or use the launch.json's "src/smart-server/src/main.ts" target in the VS Code debugger. This will start the SMART server on the specified port.

### Testing with ngrok

https://ngrok.com/

Then, run ngrok with the following command:

ngrok http YOUR_PORT

This will create a temporary public HTTPS URL for your SMART server. Copy and paste the HTTPS URL into the "Webhook Endpoint - Request URL" field in Ocean Admin Portal.
