import express from "express";
import "dotenv/config";
import { clerkWebhook } from "./controllers/webhooks.js";

const app = express();

// Remove ALL body parsers - we'll handle it manually
app.use((req, res, next) => {
  if (req.originalUrl === "/clerk") {
    next(); // Skip parsing for webhook route
  } else {
    express.json()(req, res, next); // Use JSON for other routes
  }
});

// Webhook route
app.post("/clerk", clerkWebhook);

// Standard route
app.get("/", (req, res) => res.send("API working"));

// Vercel requires module.exports for serverless functions
module.exports = app;