import { Webhook } from "svix";
import User from "../models/user.js";

export const clerkWebhook = async (req, res) => {
  try {
    const payload = req.body; // raw Buffer
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const event = whook.verify(payload, headers); // validate

    const { data, type } = event;

    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          username: `${data.first_name} ${data.last_name}`,
          email: data.email_addresses[0].email_address,
          imageUrl: data.image_url,
        };
        await User.create(userData);
        res.status(200).json({ status: "success" });
        break;
      }

      case "user.updated": {
        const userData = {
          username: `${data.first_name} ${data.last_name}`,
          email: data.email_addresses[0].email_address,
          imageUrl: data.image_url,
        };
        await User.findByIdAndUpdate(data.id, userData);
        res.status(200).json({ status: "success" });
        break;
      }

      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        res.status(200).json({ status: "success" });
        break;
      }

      default:
        res.status(200).json({ status: "ignored" });
    }
  } catch (error) {
    console.error("Webhook error:", error.message);
    res.status(400).json({ status: "failed", message: error.message });
  }
};
