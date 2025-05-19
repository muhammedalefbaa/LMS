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
  console.log("Webhook received (json):", req.body.toString());
  console.log("🔥 Stripe webhook triggered");

  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  console.log("📦 event.type:", event.type);

  switch (event.type) {
    case "payment_intent.succeeded": {
      const session = event.data.object;

      try {
        const purchaseId = session.metadata?.purchaseId;

        if (!purchaseId) {
          console.log("❌ purchaseId not found in metadata");
          break;
        }

        const purchaseData = await Purchase.findById(purchaseId);
        if (!purchaseData) {
          console.log(`❌ Purchase not found in DB: ${purchaseId}`);
          break;
        }

        const userData = await User.findById(purchaseData.userId);
        const courseData = await Course.findById(purchaseData.courseId);

        if (!userData || !courseData) {
          console.log("❌ User or Course not found");
          break;
        }

        // Check if already enrolled
        if (!courseData.enrolledStudents.includes(userData._id)) {
          courseData.enrolledStudents.push(userData._id);
          await courseData.save();
        }

        if (!userData.enrolledCourses.includes(courseData._id)) {
          userData.enrolledCourses.push(courseData._id);
          await userData.save();
        }

        purchaseData.status = "completed";
        await purchaseData.save();

        console.log("✅ Purchase marked as completed");
      } catch (error) {
        console.log(
          "❌ Error handling checkout.session.completed:",
          error.message
        );
      }

      break;
    }
    // Add other cases if needed
  }

  res.json({ received: true });
};
