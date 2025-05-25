import { Webhook } from "svix";
import User from "../models/user.js";
import Stripe from "stripe";
import Course from "../models/course.js";
import Purchase from "../models/purchase.js";
import mongoose from "mongoose";

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
  console.log("\n=== STRIPE WEBHOOK START ===");
  try {
    const sig = req.headers["stripe-signature"];
    
    let event;
    try {
      event = stripeInstance.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log("✅ Webhook signature verified");
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        try {
          const purchaseId = session.metadata?.purchaseId;
          console.log("📦 Purchase ID from metadata:", purchaseId);

          if (!purchaseId) {
            const error = "❌ purchaseId not found in metadata";
            console.error(error);
            console.error("Session metadata:", session.metadata);
            return res.status(400).send(error);
          }

          const purchaseData = await Purchase.findById(purchaseId);
          console.log("📦 Purchase data:", JSON.stringify(purchaseData, null, 2));
          
          if (!purchaseData) {
            const error = `❌ Purchase not found in DB: ${purchaseId}`;
            console.error(error);
            return res.status(404).send(error);
          }

          // First update purchase status
          purchaseData.status = "completed";
          const updatedPurchase = await purchaseData.save();
          console.log("✅ Purchase marked as completed");

          // Then handle enrollment
          const userData = await User.findById(purchaseData.userId);
          const courseData = await Course.findById(purchaseData.courseId);

          if (!userData || !courseData) {
            const error = "❌ User or Course not found";
            console.error(error, {
              userFound: !!userData,
              courseFound: !!courseData,
              userId: purchaseData.userId,
              courseId: purchaseData.courseId
            });
            return res.status(404).send(error);
          }

          // Convert user ID to ObjectId for course's enrolledStudents
          const userObjectId = mongoose.Types.ObjectId(userData._id);
          const courseObjectId = courseData._id; // Already an ObjectId

          // Check if already enrolled
          const alreadyInCourse = courseData.enrolledStudents.some(id => id.equals(userObjectId));
          const alreadyInUser = userData.enrolledCourses.some(id => id.equals(courseObjectId));
          
          console.log("Enrollment status check:", {
            alreadyInCourse,
            alreadyInUser,
            userObjectId: userObjectId.toString(),
            courseObjectId: courseObjectId.toString()
          });

          if (!alreadyInCourse) {
            courseData.enrolledStudents.push(userObjectId);
            await courseData.save();
            console.log("✅ Added user to course's enrolledStudents");
          }

          if (!alreadyInUser) {
            userData.enrolledCourses.push(courseObjectId);
            await userData.save();
            console.log("✅ Added course to user's enrolledCourses");
          }

        } catch (error) {
          console.error("❌ Error in checkout.session.completed:", error);
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
          return res.status(500).send(`Error processing webhook: ${error.message}`);
        }
        break;
      }
      default: {
        console.log(`⚠️ Unhandled event type: ${event.type}`);
      }
    }

    console.log("=== STRIPE WEBHOOK END ===\n");
    return res.status(200).json({ received: true });
    
  } catch (error) {
    console.error("❌ Fatal webhook error:", error.message);
    console.error("Stack trace:", error.stack);
    return res.status(500).send(`Fatal webhook error: ${error.message}`);
  }
};
