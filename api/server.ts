import "dotenv/config";
import express from "express";
import cors from "cors";

import { reposRouter } from "./repos";
import { commitsRouter } from "./commits";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/repos", reposRouter);
app.use("/commits", commitsRouter);

const port = Number(process.env.API_PORT ?? 4000);

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
