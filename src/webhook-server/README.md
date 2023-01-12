## Webhook Test Server

Ocean sends "push" messages to an integrated server when certain events occur. This module can be used as a prototype for your server to test the protocols and content of these messages.

Set your preferred port in .env:
PORT=3000

To run it, run "npm run webhook-server" in the command line or use the launch.json's "src/webhook-server/main.ts" target in the VS Code debugger. This will start the webhook server on the specified port.

To test the webhook server, create an integration within Ocean in your test site's Ocean Admin Portal:

https://test.cognisantmd.com/ocean/portal.html#/admin/integrations/

_Note:_ Both "Patient Engagement" and "eReferrals" integrations send webhook events, so you can test both types of integrations with this module. Note however that the payload content is different for each integration type.

Set the integration's "Webhook Endpoint - Request URL" to point to your running webhook server. Note how Ocean forces the endpoint to be HTTPS, so you will need to use a reverse proxy to test locally.

For example, you can install ngrok to create a public URL for your local webhook server:

https://ngrok.com/

Then, run ngrok with the following command:

ngrok http YOUR_PORT

This will create a temporary public HTTPS URL for your webhook server. Copy and paste the HTTPS URL into the "Webhook Endpoint - Request URL" field in Ocean Admin Portal.
