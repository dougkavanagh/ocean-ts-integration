import fs from "fs";
import schema from "./fhir-schema";
import { Validator } from "jsonschema";

const v = new Validator();
const instance = JSON.parse(
  fs.readFileSync("./src/fhir-validator/fhir-payload-to-validate.json", "utf8")
);
const result = v.validate(instance, schema);
if (result.errors.length > 0) {
  console.error(result.errors);
} else {
  console.log("Valid FHIR!");
}
//
