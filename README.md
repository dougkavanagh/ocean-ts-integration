# Ocean Integration Testing Typescript Project

This project assists third parties integrating with Ocean using any of the following APIs and connection protocols:

- [Ocean FHIR API](https://ocean.cognisantmd.com/public/fhirApiDocs.html)
- [Ocean Open API](https://ocean.cognisantmd.com/public/apiDocs.html)
- [SMART on FHIR (using Ocean as a SMART client application)](https://support.cognisantmd.com/hc/en-us/articles/360057458272-Ocean-SMART-App-Launch-Overview-SMART-on-FHIR-EHR-Contextual-Launch-)
- [Ocean Cloud Connect's FHIR Protocol](<(https://simplifier.net/ocean-cloud-connect-fhir-implementation-guide)>)

The project consists of a series of reference implementations and test stubs.

The code is written in Typescript and designed primarily to be run within VSCode. However, any language could be used to connect using the same protocols. Java reference implementations are also available upon request.

## Getting Started

- Run "npm i" to install the node_modules
- Create a .env file in this workspace folder and include:
- OCEAN_HOST="https://test.cognisantmd.com"
- (or https://staging.cognisantmd.com, https://ocean.cognisantmd.com, depending on your Ocean test environment)

## Testable Modules

This project has several different semi-independent modules for testing Ocean integrations:

## projects/fhir-client: FHIR Client

The FHIR client can be used to authorize and issue RESTful calls against Ocean's [FHIR API](<[https://](https://ocean.cognisantmd.com/public/fhirApiDocs.html)>), particularly the "incoming message" API [$process-message](https://ocean.cognisantmd.com/public/fhirApiDocs.html#operation/process-messages_1) POST endpoint for updating Ocean eReferrals, eConsults, eOrders. The FHIR client can also be used to interact with Ocean's health service directory.

### projects/smart-client: Ocean Test SMART Client App (for testing against SMART servers)

This module can be used to test your SMART launch server (EHR/EMR) as if it would launch Ocean as a SMART OIDC client application, as described in the documentation guide:
[Ocean SMART App Launch Overview](<[https://](https://support.cognisantmd.com/hc/en-us/articles/360057458272-Ocean-SMART-App-Launch-SMART-on-FHIR-EHR-Contextual-Launch-)>)

### projects/smart-server: SMART Server Reference Implementation (for testing against an Ocean SMART client)

This module can be used as a reference implementation for a SMART launch server (EHR/EMR) as if it would
act as the OIDC/SMART-compatible EMR/EHR launching Ocean, as described in the documentation guide:
[Ocean SMART App Launch Overview](<[https://](https://support.cognisantmd.com/hc/en-us/articles/360057458272-Ocean-SMART-App-Launch-SMART-on-FHIR-EHR-Contextual-Launch-)>)

## projects/webhook-server: Webhook Testing for FHIR API Messages and Open API Events

Ocean sends "push" messages to an integrated server when certain events occur. This module can be used as a prototype for your server to test the protocols and content of these messages.

## projects/fhir-validator: FHIR Resource Validation

The FHIR validator can be used to validate specific JSON payloads during testing to ensure they are adherent to the FHIR R4 specification as used by Ocean.

Although there are many FHIR validators available online, it may be difficult to isolate one that provides warnings and errors that are pertinent to Ocean's implementation; some are quite noisy in the number of errors they generate. This validator aims to provide a more focused set of errors and warnings based on specific requirements regarding Ocean's FHIR implementations.

## projects/open-api: Ocean Open API Client

This module can be used to test the Ocean Open API. Note that the Ocean Open API is deprecated; use the FHIR API instead. The source code here is included for the sake of supporting legacy implementations.

## src/cloud-connect: Test your Cloud Connect-compatible FHIR server

This module can be used to test the basic authorization and data exchange protocols used by Cloud Connect. If you are planning to connect your EHR/EMR with Ocean via Cloud Connect, start by consulting the [Ocean Cloud Connect FHIR Implementation Guide](https://simplifier.net/ocean-cloud-connect-fhir-implementation-guide).
