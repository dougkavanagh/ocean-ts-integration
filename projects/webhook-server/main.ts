import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { PORT } from "./env";
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(
  bodyParser.json({ type: ["application/fhir+json", "application/json"] })
);

app.use(
  express.json({
    type: ["application/json", "application/fhir+json"],
    limit: "10mb",
  })
);
const router = express.Router();

router.get("", (_, res: Response) => {
  console.info("Received webhook GET request");
  res.send(
    "This is the webhook endpoint GET handler. It's expecting a POST for a challenge reply or a service request payload"
  );
});

router.post("", async (req: Request, res: Response): Promise<void> => {
  const body = req.body;
  console.info(`Webhook POST:`);
  console.info(JSON.stringify(body));
  const { challenge } = body;
  if (challenge) {
    console.info(
      "Received webhook challenge request; echoing back " + challenge
    );
    res.status(200).type("application/json").send({
      challenge: challenge,
    });
  } else if (body.resourceType === "Bundle") {
    console.info("Received eReferral Bundle payload");
    // https://simplifier.net/guide/ca-on-eReferral-r4-iguide-v0.10.1/allartifacts?version=current
    res.status(200).type("application/json").send({
      success: true,
    });
  } else {
    console.info("Received unexpected payload");
    res.status(400).type("application/json").send({
      success: false,
    });
  }
});
app.use("/", router);

app.listen(PORT, () => {
  console.log(`Webhook server is listening at http://localhost:${PORT}`);
});
