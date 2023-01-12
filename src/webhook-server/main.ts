import express, { Request, Response } from "express";
import { PORT } from "./env";
const app = express();

app.use(express.json());

app.use(
  express.json({
    type: ["application/json", "application/fhir+json"],
    limit: "10mb",
  })
);
const router = express.Router();

router.get("", (_, res: Response) => {
  res.send(
    "This is the webhook endpoint GET handler. It's expecting a POST for a challenge reply or a service request payload"
  );
});

router.post("", async (req: Request, res: Response): Promise<void> => {
  console.info(`Received webhook POST: ${req.body}`);
  const { challenge } = req.body;
  if (challenge) {
    console.info(
      "Received webhook challenge request; echoing back " + challenge
    );
    res.status(200).type("application/json").send({
      challenge: challenge,
    });
  } else {
    console.info("Received service request payload");
    res.status(200).type("application/json").send({
      success: true,
    });
  }
});
app.use("/", router);

app.listen(PORT, () => {
  console.log(`Webhook server is listening at http://localhost:${PORT}`);
});
