## FHIR Client

The FHIR client can be used to authorize and issue RESTful calls against Ocean's [FHIR API](<[https://](https://ocean.cognisantmd.com/public/fhirApiDocs.html)>), particularly the "incoming message" API [$process-message](https://ocean.cognisantmd.com/public/fhirApiDocs.html#operation/process-messages_1) POST endpoint for updating Ocean eReferrals, eConsults, eOrders. The FHIR client can also be used to interact with Ocean's health service directory.

Much of Ocean's FHIR API is designed to adhere to the [Ontario eReferral FHIR Implementation Guide](<[https://](https://simplifier.net/guide/ereferral-ontario/integrationmethods?version=current)>)

To authenticate the FHIR client, as discussed in the documentation, you first need to create OAuth2 credentails at your Ocean site: https://staging.cognisantmd.com/ocean/portal.html#/admin/credentials/

Set the following values in .env:

- CLIENT_ID=your_client_id
- CLIENT_SECRET=your_client_secret
- REFERRAL_REF=your-test-referral-eg-4c108d2c-6199-4a7f-86b4-8e036dc1531a
- APPOINTMENT_ID= (only if you are testing eReferral appointment updates)

To run it, run "npm run fhir" in the command line or use launch the launch.json's "src/fhir/main.ts" target in the VS Code debugger.
Edit the source in main.ts to test what you need.

To test outgoing "push" FHIR messages from the Ocean, use the Webhook Test Server module (webhook-server).
