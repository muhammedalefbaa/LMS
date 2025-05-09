import { Webhook } from "svix";
import User from "../models/user.js";

export const clerkWebhook = async (req, res) => {
  try {
    const payload = req.body.toString(); // 🔑 raw string payload
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const evt = wh.verify(payload, headers);
    const { data, type } = evt;

    console.log("✅ Webhook verified:", type);

    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          username: `${data.first_name} ${data.last_name}`,
          email: data.email_addresses[0].email_address,
          imageUrl: data.image_url,
        };
        await User.create(userData);
        console.log("✅ User created:", userData);
        res.json({ status: "success" });
        break;
      }

      case "user.updated": {
        const userData = {
          username: `${data.first_name} ${data.last_name}`,
          email: data.email_addresses[0].email_address,
          imageUrl: data.image_url,
        };
        await User.findByIdAndUpdate(data.id, userData);
        res.json({ status: "success" });
        break;
      }

      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        res.json({ status: "success" });
        break;
      }

      default:
        res.status(400).json({ status: "ignored", message: "Unknown event" });
    }
  } catch (error) {
    console.error("❌ Webhook error:", error.message);
    res.status(400).json({ status: "failed", message: error.message });
  }
};
