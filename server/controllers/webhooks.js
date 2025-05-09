import { Webhook } from "svix";
import User from "../models/user.js";

export const clerkWebhook = async (req, res) => {
  try {
    // Get headers and raw body directly from request
    const payload = req.body; // Already raw from your middleware
    const headers = {
      "svix-id": req.headers["svix-id"] || req.headers["webhook-id"],
      "svix-timestamp": req.headers["svix-timestamp"] || req.headers["webhook-timestamp"],
      "svix-signature": req.headers["svix-signature"] || req.headers["webhook-signature"],
    };

    // Verify webhook
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const evt = wh.verify(payload, headers);
    const { data, type } = evt;

    console.log("✅ Webhook verified:", type);

    // Process events
    switch (type) {
      case "user.created":
        await User.create({
          _id: data.id,
          username: `${data.first_name} ${data.last_name}`.trim(),
          email: data.email_addresses.find(e => e.id === data.primary_email_address_id)?.email_address,
          imageUrl: data.image_url,
        });
        break;
        
      case "user.updated":
        await User.findByIdAndUpdate(data.id, {
          username: `${data.first_name} ${data.last_name}`.trim(),
          email: data.email_addresses.find(e => e.id === data.primary_email_address_id)?.email_address,
          imageUrl: data.image_url,
        });
        break;
        
      case "user.deleted":
        await User.findByIdAndDelete(data.id);
        break;
    }

    return res.json({ status: "success" });
  } catch (err) {
    console.error("❌ Webhook error:", err.message);
    return res.status(400).json({ error: "Webhook verification failed" });
  }
};