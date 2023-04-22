## SMART Test Server

Ocean sends "push" messages to an integrated server when certain events occur. This module can be used as a prototype for your server to test the protocols and content of these messages.

## Getting Started

Create a "".env" file in this folder (the project root):
PORT=9500
SESSION_SECRET=YOUR_SESSION_SECRET
OIDC_PRIVATE_KEY=YOUR_OIDC_PRIVATE_KEY
OIDC_PUBLIC_KEY=YOUR_OIDC_PUBLIC_KEY

Set your preferred port in .env:
PORT=3000
SESSION_SECRET=YOUR_SESSION_SECRET

To run it, run "npm run smart-server" in the command line or use the launch.json's "src/smart-server/src/main.ts" target in the VS Code debugger. This will start the SMART server on the specified port.

### Testing with ngrok

https://ngrok.com/

Then, run ngrok with the following command:

ngrok http YOUR_PORT

This will create a temporary public HTTPS URL for your SMART server. Copy and paste the HTTPS URL into the "Webhook Endpoint - Request URL" field in Ocean Admin Portal.
