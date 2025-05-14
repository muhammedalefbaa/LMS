import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import { clerkWebhooks } from "./controllers/webhooks.js";

// init express

const app = express();

//call the database

connectDB();

// middlewares

app.use(cors());

//routes

app.get("/", (req, res) => {
  res.send("hello from server");
});

app.post("/clerk", express.json(), clerkWebhooks);

// PORT

const PORT = process.env.PORT || 5000;

// listen
app.listen(PORT, () => {
  console.log("Server running on port ", PORT);
});
