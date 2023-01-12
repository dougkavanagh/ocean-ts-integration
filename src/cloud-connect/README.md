## Test your Cloud Connect-compatible FHIR server

If you are planning to connect your EHR/EMR with Ocean via Cloud Connect, start by consulting the [Ocean Cloud Connect FHIR Implementation Guide](<[https://](https://simplifier.net/ocean-cloud-connect-fhir-implementation-guide)>).

This module can be used to test the basic authorization and data exchange protocols used by Cloud Connect, as specified in the implementation guide. It may also serve as a useful starting point for an integration test suite for your EHR/EMR.

After using this module to test the basics, you should proceed to test your FHIR server with Cloud Connect itself, by setting up a Cloud Connect to connect to your test server. However, it may be difficult to troubleshoot issues in the early stages of development.
