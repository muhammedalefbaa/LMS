import { Webhook } from "svix";
import User from "../models/user.js";

export const clerkWebhook = async (req, res, rawBody) => {
  try {
    // Verify we have the raw body
    if (!rawBody) {
      throw new Error("No raw body received");
    }

    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    // Verify webhook
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const evt = wh.verify(rawBody, headers);
    const { data, type } = evt;

    console.log("Webhook verified:", type);

    // Process events
    switch (type) {
      case "user.created":
        await User.create({
          _id: data.id,
          email: data.email_addresses[0]?.email_address,
          imageUrl: data.image_url,
        });
        break;
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Webhook error:", {
      message: err.message,
      stack: err.stack,
      rawBody: rawBody?.substring(0, 100),
      headers: req.headers,
    });
    return res.status(400).json({ error: "Webhook processing failed" });
  }
};