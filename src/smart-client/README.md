### Test your SMART launch server

The SMART client can be used to test your SMART launch server, as described in the documentation guide:
[Ocean SMART App Launch Overview](<[https://](https://support.cognisantmd.com/hc/en-us/articles/360057458272-Ocean-SMART-App-Launch-SMART-on-FHIR-EHR-Contextual-Launch-)>)

Configuring a SMART OIDC-compatible server can be complex. This test client can help you test and debug against your SMART launch server. It simulates the launch sequence that your EHR will perform and then, once launched, behaves like Ocean as a standard OIDC client to execute the single sign-on and authorization flow, followed by RESTful SMART FHIR API calls using the access token provided by your server.

#### Setup

To begin, specify your SMART "iss" server in .env, e.g.:
FHIR_SERVER_URL=http://localhost:59468/api/fhir

You will also need to specify your server's OAuth2 credentials for this SMART test client in .env:

CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret (optional)

To run it, run "npm run smart-client" in the command line or use the launch.json's "src/smart-client/main.ts" target in the VS Code debugger.

#### Step 1: Launch Sequence

The program will generate a suggested launch URL, simulating what your EHR would do. Copy and paste this URL into your browser to test the launch sequence. After your browser issues an HTTP GET call as defined by this URL, the program runs code in launch-handler.ts.

#### Step 2: OIDC Discovery

- The launch-handler.ts uses the open-source openid-client to "discover" the OIDC endpoints for your SMART server:
- The client first attempts to locate the openid-configuration endpoint by appending "/.well-known/openid-configuration" to the "iss" URL, as defined in the OIDC specification.
- Once the OIDC endpoints are discovered, the client redirects the browser to your server's published "authorize" endpoint to request an authorization code.

#### Step 3: OIDC/SMART Authorization Redirect

- The browser is redirected to the "authorize" endpoint on your EMR/EHR, which may prompt the user to login and authorize the client application (if not already signed in). After this, your server should redirect the user back to the smart-client's "redirect_uri" with an authorization code.

#### Step 4: OIDC/SMART Redirect Handling

- Once the authorization code is received, the client (redirect-handler.ts) uses the "token" endpoint to request an access token, using the authorization_code grant type, the authorization code received in the redirect, and the client_id and client_secret credentials.

#### Step 5: OIDC Validation of id_token

- The client then validates the id_token, which is a JWT token that contains the user's identity and other information. The client uses the "jwks_uri" endpoint defined in the openid-configuration to retrieve the public key used to sign the token, and then validates the signature and other claims (checkOIDC).

#### Step 6: FHIR Client Queries

// PENDING: Once the OIDC validation is complete, the client can then use the access token to make FHIR API calls to your server. Ocean will read from the FHIR Patient endpoint to retrieve the patient's demographics and other information (with additional endpoints to be implemented in the future).
