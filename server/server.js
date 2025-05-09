import express from "express";
import "dotenv/config";
import { clerkWebhook } from "./controllers/webhooks.js";

const app = express();

// Disable all body parsing for webhook route
app.post("/clerk", (req, res) => {
  let data = "";
  req.on("data", (chunk) => (data += chunk));
  req.on("end", () => clerkWebhook(req, res, data));
});

// Regular JSON middleware for other routes
app.use(express.json());

app.get("/", (req, res) => res.send("API working"));

// Vercel needs this export
export default app;