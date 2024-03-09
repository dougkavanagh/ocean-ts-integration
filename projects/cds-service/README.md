### Test CDS Hooks Server

This project is designed to as a simple overview and test hub for Ocean's invocation of CDS services, particularly for eOrdering validation.

This SMART client behaves similarly to Ocean's SMART client application, particularly with the network sequence flow described in the documentation guide:
[Ocean SMART App Launch Overview](https://support.cognisantmd.com/hc/en-us/articles/360057458272-Ocean-SMART-App-Launch-SMART-on-FHIR-EHR-Contextual-Launch-)

Configuring a SMART OIDC-compatible server can be complex. This SMART client can be used to test against your SMART launch server, to ensure that it is configured correctly and that it is able to (potentially) successfully launch with single sign-on into Ocean using the EHR user credentials via OIDC.

The client simulates the launch sequence that your EHR will perform; then, once launched, like Ocean, it acts as a standard OIDC client to execute the single sign-on and authorization flow. Once the sign-in complete, it proceeds to query the FHIR server's API calls using the access token provided by the SMART server.

#### Setup

To begin, cd to the directory and run:

npm i

The port defaults to 9501 but you can change it via a .env file if necessary.

#### Execution

To run it, run "npm run serve" in the command line or use the launch.json's "src/cds-service/src/main.ts" target in the VS Code debugger.

This will run the server and the main.ts test file, which starts by requesting the available cds-services at the host endpoint.
It then calls the order-sign hook.
