import { config } from "dotenv";
const parsed = config().parsed;

export const PORT = parsed?.PORT ?? "8888";
