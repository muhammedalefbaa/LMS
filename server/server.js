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

//call the database

connectDB();
connectCloudinary(); // Initialize Cloudinary configuration

// middlewares

app.use(cors());
app.use(clerkMiddleware());

//routes

app.get("/", (req, res) => {
  res.send("hello from server");
});
app.post("/stripe", express.raw({ type: "application/json" }), stripeWebhooks)
app.post("/clerk", express.json(), clerkWebhooks);

app.use("/api/educator", express.json(), educatorRoute);
app.use("/api/course", express.json(), courseRoute);
app.use("/api/user", express.json(), userRoute);

// PORT

const PORT = process.env.PORT || 5000;

// listen
app.listen(PORT, () => {
  console.log("Server running on port ", PORT);
});
