import express from "express";
import { PORT } from "../env";
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/", async (req, res) => {
  try {
    const { type, challenge } = req.body;
    console.log(type);
    console.log(challenge);
    res.status(200).send({
      challenge: challenge,
    });
  } catch (error) {
    console.log(error);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
