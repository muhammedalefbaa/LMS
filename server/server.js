import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import { clerkWebhooks, stripeWebhooks } from "./controllers/webhooks.js";
import educatorRoute from "./routes/educatorRoute.js";
import courseRoute from "./routes/courseRoute.js";
import { clerkMiddleware } from "@clerk/express";
import connectCloudinary from "./configs/cloudinary.js";
import userRoute from "./routes/userRoute.js";

// init express
const app = express();

// Stripe webhook route must be before any other middleware that parses the body
app.post("/stripe", express.raw({ type: "application/json" }), stripeWebhooks);

// Connect to database
connectDB();
connectCloudinary();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(clerkMiddleware());
app.use("/api/educator", educatorRoute);
app.use("/api/course", courseRoute);
app.use("/api/user", userRoute);
app.post("/clerk", clerkWebhooks);

// Start server
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
