import express from "express";
import cors from "cors";
import "dotenv/config";
import bodyParser from "body-parser";
import connectDB from "./configs/mongodb.js";
import { clerkWebhook } from "./controllers/webhooks.js";

const app = express();

// Global middlewares
app.use(cors());
app.use(express.json()); // This is OK globally

// Raw body only for Clerk webhook
app.post("/clerk", bodyParser.raw({ type: "application/json" }), clerkWebhook);

// Test route
app.get("/", (req, res) => res.send("API working"));

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
