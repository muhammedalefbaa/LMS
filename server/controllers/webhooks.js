import { Webhook } from "svix";
import User from "../models/user.js";

// API controller function to manage clerk user with database
export const clerkWebhook = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });
    const { data, type } = req.body;

    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imgUrl: data.image_url,
        };
        await User.create(userData);
        res.json({ status: "success" });
        break;
      }

      case "user.updated": {
        const userData = {
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imgUrl: data.image_url,
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
    }
  } catch (error) {
    res.json({ status: "failed", message: error.message });
  }
};
