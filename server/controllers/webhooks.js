import { Webhook } from "svix";
import User from "../models/user.js";
import Stripe from "stripe";
import Course from "../models/course.js";
import Purchase from "../models/purchase.js";

//api controller method to manage clerk user from database
export const clerkWebhooks = async (req, res) => {
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
          imageUrl: data.image_url,
        };
        await User.create(userData);
        res.json({});
        break;
      }

      case "user.updated": {
        const userData = {
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        };
        await User.findByIdAndUpdate(data.id, userData);
        res.json({});
        break;
      }

      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        res.json({});
        break;
      }
      default:
        break;
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
    console.log(error);
  }
};

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
export const stripeWebhooks = async (req, res) => {
  const webhookStartTime = new Date().toISOString();
  console.log("\n=== STRIPE WEBHOOK START ===");
  console.log("⏰ Webhook received at:", webhookStartTime);
  console.log("📝 Request Method:", req.method);
  console.log("🔑 Stripe Signature:", req.headers["stripe-signature"]);
  console.log("💡 Content-Type:", req.headers["content-type"]);
  
  try {
    // Log the raw body as string
    const rawBody = req.body.toString('utf8');
    console.log("📦 Raw Body Length:", rawBody.length);
    console.log("📦 Raw Body Preview:", rawBody.substring(0, 100) + "...");

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
    }

    const sig = req.headers["stripe-signature"];
    if (!sig) {
      throw new Error("No stripe signature found in headers");
    }

    let event;
    try {
      event = stripeInstance.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log("✅ Webhook signature verified successfully");
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      console.error("Full error:", err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("📦 Event type:", event.type);
    console.log("📦 Event ID:", event.id);
    
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("💳 Checkout Session ID:", session.id);
      console.log("📋 Session Metadata:", session.metadata);
      
      try {
        const purchaseId = session.metadata?.purchaseId;
        if (!purchaseId) {
          throw new Error("Purchase ID not found in metadata");
        }
        console.log("🔍 Looking up purchase:", purchaseId);

        const purchaseData = await Purchase.findById(purchaseId);
        if (!purchaseData) {
          throw new Error(`Purchase not found: ${purchaseId}`);
        }
        console.log("📝 Current purchase status:", purchaseData.status);
        
        // Update purchase status
        purchaseData.status = "completed";
        const updatedPurchase = await purchaseData.save();
        console.log("✅ Updated purchase status to:", updatedPurchase.status);
        
        // Rest of your existing code for updating user and course...
        
      } catch (error) {
        console.error("❌ Error processing checkout session:", error.message);
        console.error("Full error:", error);
        return res.status(500).send(`Error processing checkout: ${error.message}`);
      }
    }

    const webhookEndTime = new Date().toISOString();
    console.log("⏰ Webhook completed at:", webhookEndTime);
    console.log("=== STRIPE WEBHOOK END ===\n");
    
    return res.status(200).json({ received: true });
    
  } catch (error) {
    console.error("❌ Fatal webhook error:", error.message);
    console.error("Stack trace:", error.stack);
    return res.status(500).send(`Fatal webhook error: ${error.message}`);
  }
};
