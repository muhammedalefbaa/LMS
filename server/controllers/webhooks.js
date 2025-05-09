import { Webhook } from "svix";
import User from "../models/user.js";

export const clerkWebhook = async (req, res) => {
  try {
    const payload = req.body.toString("utf8");
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const evt = wh.verify(payload, headers); // 🔐 This line fails if body is not raw
    const { data, type } = evt;

    console.log("✅ Webhook verified:", type);

    switch (type) {
      case "user.created":
        await User.create({
          _id: data.id,
          username: `${data.first_name} ${data.last_name}`,
          email: data.email_addresses[0].email_address,
          imageUrl: data.image_url,
        });
        break;
      case "user.updated":
        await User.findByIdAndUpdate(data.id, {
          username: `${data.first_name} ${data.last_name}`,
          email: data.email_addresses[0].email_address,
          imageUrl: data.image_url,
        });
        break;
      case "user.deleted":
        await User.findByIdAndDelete(data.id);
        break;
    }

    res.json({ status: "success" });
  } catch (err) {
    console.error("❌ Webhook error:", err.message);
    res.status(400).json({ error: err.message });
  }
};
