import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import { clerkWebhook } from "./controllers/webhooks.js";

const app = express();

// Global middlewares
app.use(cors());
app.use(express.json());

// Clerk webhook route - critical raw body handling
app.post("/clerk", 
  (req, res, next) => {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      req.rawBody = data;
      next();
    });
  },
  clerkWebhook
);

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