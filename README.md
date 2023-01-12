# Ocean Integration Testing Typescript Project

This project assists third parties integrating with Ocean using any of the following APIs and connection protocols:

- Ocean's FHIR API
- Ocean Open API
- SMART on FHIR (using Ocean as a SMART client application)
- Ocean Cloud Connect FHIR API

The project consists of a series of reference implementations and test stubs.

The code is written in Typescript and designed primarily to be run within VSCode, but any language could be used to connect, using these same protocols. Java reference implementations are also available upon request.

## Getting Started

- Run "npm i" to install the node_modules
- Create a .env file in this workspace folder and include:
- OCEAN_HOST="https://test.cognisantmd.com"
- (or https://staging.cognisantmd.com, https://ocean.cognisantmd.com, depending on your Ocean test environment)

## Testable Modules

This project has several different semi-independent modules for testing Ocean integrations:

## src/fhir-client: FHIR Client

The FHIR client can be used to authorize and issue RESTful calls against Ocean's [FHIR API](<[https://](https://ocean.cognisantmd.com/public/fhirApiDocs.html)>), particularly the "incoming message" API [$process-message](https://ocean.cognisantmd.com/public/fhirApiDocs.html#operation/process-messages_1) POST endpoint for updating Ocean eReferrals, eConsults, eOrders. The FHIR client can also be used to interact with Ocean's health service directory.

## src/fhir-validator: FHIR Resource Validation

The FHIR validator can be used to validate specific JSON payloads during testing to ensure they are adherent to the FHIR R4 specification as used by Ocean.

## src/open-api: Ocean Open API Client

This module can be used to test the Ocean Open API. Note that the Ocean Open API is deprecated; use the FHIR API instead. The source code here is included for the sake of supporting legacy implementations.

### src/smart-client: Test your SMART launch server

The SMART client can be used to test your SMART launch server, as described in the documentation guide:
[Ocean SMART App Launch Overview](<[https://](https://support.cognisantmd.com/hc/en-us/articles/360057458272-Ocean-SMART-App-Launch-SMART-on-FHIR-EHR-Contextual-Launch-)>)

## src/webhook-server: Webhook Testing

Ocean sends "push" messages to an integrated server when certain events occur. This module can be used as a prototype for your server to test the protocols and content of these messages.

## src/cloud-connect: Test your Cloud Connect-compatible FHIR server
