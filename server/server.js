import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import { clerkWebhook } from "./controllers/webhooks.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // For all other routes

// Webhook route must come BEFORE express.json() is applied to it
import bodyParser from "body-parser";
app.post('/clerk', bodyParser.raw({ type: 'application/json' }), clerkWebhook);

// Basic test route
app.get("/", (req, res) => res.send("API working"));

// Start server
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();
