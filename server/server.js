import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import { clerkWebhook } from "./controllers/webhooks.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Recommended if you're working with JSON bodies

// Routes
app.get("/", (req, res) => res.send("API working"));
app.post('/clerk', express.json(), clerkWebhook);

// Start server inside an async function
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
