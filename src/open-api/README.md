## Ocean Open API Client

**The Ocean Open API is deprecated and is no longer supported. For new integration projects, use the FHIR API instead. The source code here is included for the sake of legacy implementations.**

This module can be used to test the Ocean Open API as a client application making RESTful calls. It demonstrates how to authenticate with the Open API, how to make calls to the Open API endpoints, and how to decrypt and encrypt patient data.

Set the following values in .env:

- CLIENT_ID=your_client_id
- CLIENT_SECRET=your_client_secret
- SITE_NUM=your_site_num
- SHARED_ENCRYPTION_KEY=your_shared_encryption_key

Depending on what you are testing, the following variables may also be relevant:

- REFERRAL_REF=your-test-referral-eg-4c108d2c-6199-4a7f-86b4-8e036dc1531a
- SITE_NUM=your_site_num
- APPOINTMENT_ID=the_ocean_appointment_id (only if you are testing eReferral appointment updates)

To run the client, execute "npm run fhir" in the command line or use launch the launch.json's "src/fhir/main.ts" target in the VS Code debugger.
Edit the source in main.ts to test what you need.

To test outgoing "push" message events from the Open API client, use the Webhook Testing module (webhook-server).
