import { Webhook } from "svix";
import User from "../models/user.js";

export const clerkWebhook = async (req, res) => {
  return new Promise((resolve) => {
    let data = '';
    
    // Manually collect raw data stream
    req.on('data', chunk => {
      data += chunk;
    });

    req.on('end', async () => {
      try {
        const headers = {
          "svix-id": req.headers["svix-id"],
          "svix-timestamp": req.headers["svix-timestamp"],
          "svix-signature": req.headers["svix-signature"],
        };

        // Verify webhook
        const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        const evt = wh.verify(data, headers);
        const { data: userData, type } = evt;

        console.log("✅ Webhook verified:", type);

        // Process events
        switch (type) {
          case "user.created":
            await User.create({
              _id: userData.id,
              email: userData.email_addresses[0]?.email_address,
              imageUrl: userData.image_url
            });
            break;
        }

        res.json({ success: true });
        resolve();
      } catch (err) {
        console.error("❌ Webhook failed:", {
          error: err.message,
          rawBody: data.substring(0, 100), // Log first 100 chars
          headers: req.headers
        });
        res.status(400).json({ error: "Webhook failed" });
        resolve();
      }
    });
  });
};