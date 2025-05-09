import { Webhook } from "svix";
import User from "../models/user.js";

export const clerkWebhook = async (req, res) => {
  try {
    // The payload is already properly parsed by express.raw()
    const payload = req.body;
    
    // Verify we have the raw body as Buffer
    if (!Buffer.isBuffer(payload)) {
      throw new Error("Payload must be a Buffer");
    }

    // Prepare headers (Clerk uses multiple naming conventions)
    const headers = {
      "svix-id": req.headers["svix-id"] || req.headers["webhook-id"],
      "svix-timestamp": req.headers["svix-timestamp"] || req.headers["webhook-timestamp"],
      "svix-signature": req.headers["svix-signature"] || req.headers["webhook-signature"],
    };

    // Debug output (remove in production)
    console.log("Webhook received", {
      payloadLength: payload.length,
      headers: headers
    });

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
          username: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Anonymous',
          email: data.email_addresses.find(e => e.id === data.primary_email_address_id)?.email_address,
          imageUrl: data.image_url,
        });
        break;
        
      case "user.updated":
        await User.findByIdAndUpdate(data.id, {
          username: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Anonymous',
          email: data.email_addresses.find(e => e.id === data.primary_email_address_id)?.email_address,
          imageUrl: data.image_url,
        });
        break;
        
      case "user.deleted":
        await User.findByIdAndDelete(data.id);
        break;
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("❌ Webhook error:", {
      message: err.message,
      stack: err.stack,
      receivedBody: req.body?.toString().substring(0, 100) // Log first 100 chars
    });
    return res.status(400).json({ 
      error: "Webhook processing failed",
      details: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
};