import Course from "../models/course.js";
import User from "../models/user.js";
import Purchase from "../models/purchase.js";
import Stripe from "stripe";
import courseProgress from "../models/courseProgress.js";

// Get user data
export const getUserData = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const userData = await User.findById(userId);

    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, userData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get enrolled courses
export const userEnrolledCourses = async (req, res) => {
  try {
    console.log("\n=== FETCHING ENROLLED COURSES ===");
    const userId = req.auth.userId;
    console.log("🔍 Fetching enrolled courses for user:", userId);

    const userData = await User.findById(userId).populate("enrolledCourses");
    
    if (!userData) {
      console.error("❌ User not found:", userId);
      return res.json({ success: false, message: "User not found" });
    }

    console.log("📦 User data found:", {
      _id: userData._id,
      name: userData.name,
      enrolledCoursesCount: userData.enrolledCourses?.length || 0
    });

    if (userData.enrolledCourses?.length > 0) {
      console.log("📚 Enrolled courses:", userData.enrolledCourses.map(course => ({
        _id: course._id,
        title: course.courseTitle
      })));
    } else {
      console.log("ℹ️ No enrolled courses found for user");
    }

    console.log("=== FETCH COMPLETE ===\n");
    res.json({ success: true, enrolledCourses: userData.enrolledCourses || [] });
  } catch (error) {
    console.error("❌ Error fetching enrolled courses:", error);
    console.error(error.stack);
    res.json({ success: false, message: error.message });
  }
};

// Purchase course and generate product key
export const purchaseCourse = async (req, res) => {
  console.log("\n=== STARTING PURCHASE PROCESS ===");
  try {
    const { courseId } = req.body;
    const { origin } = req.headers;
    const userId = req.auth.userId;
    
    console.log("📦 Purchase Details:", {
      courseId,
      userId,
      origin
    });

    const userData = await User.findById(userId);
    const courseData = await Course.findById(courseId);
    
    console.log("🔍 Found User:", !!userData);
    console.log("🔍 Found Course:", !!courseData);

    if (!userData || !courseData) {
      console.error("❌ User or course not found");
      return res.json({ success: false, message: "User or course not found" });
    }

    const amount = Number(
      (
        courseData.coursePrice -
        (courseData.discount * courseData.coursePrice) / 100
      ).toFixed(2)
    );

    const purchaseData = {
      courseId: courseData._id,
      userId,
      amount,
      status: "pending" // explicitly set status
    };

    console.log("💰 Creating purchase with data:", purchaseData);
    const newPurchase = await Purchase.create(purchaseData);
    console.log("✅ Purchase created:", {
      purchaseId: newPurchase._id,
      status: newPurchase.status
    });

    // Stripe gateway init
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const currency = process.env.CURRENCY?.toLowerCase() || 'usd';

    // Creating line items for Stripe
    const line_items = [
      {
        price_data: {
          currency,
          product_data: {
            name: courseData.courseTitle,
          },
          unit_amount: Math.floor(amount * 100), // convert to smallest currency unit
        },
        quantity: 1,
      },
    ];

    console.log("💳 Creating Stripe session with metadata:", {
      purchaseId: newPurchase._id.toString()
    });

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/my-enrollment`,
      cancel_url: `${origin}/`,
      line_items,
      mode: "payment",
      metadata: {
        purchaseId: newPurchase._id.toString(),
      },
    });

    console.log("✅ Stripe session created:", {
      sessionId: session.id,
      url: session.url
    });
    console.log("=== PURCHASE PROCESS COMPLETE ===\n");

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.error("❌ Error in purchase process:", error.message);
    console.error(error.stack);
    res.json({ success: false, message: error.message });
  }
};

//update user course progress
export const updateUserCourseProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { courseId, lectuerId } = req.body;
    const progressData = await courseProgress.findOne({ userId, courseId });
    if (progressData) {
      if (progressData.lectuerCompleted.includes(lectuerId)) {
        return res.json({
          success: true,
          message: "Lectuer already completed",
        });
      }
      progressData.lectuerCompleted.push(lectuerId);
      await progressData.save();
      res.json({ success: true, message: "Lectuer completed successfully" });
    } else {
      await courseProgress.create({
        userId,
        courseId,
        lectuerCompleted: [lectuerId],
      });
    }
    res.json({ success: true, message: "Lectuer completed successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//get user course progress
export const getUserCourseProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    // Get all progress data for the user
    const progressData = await courseProgress.find({ userId });
    res.json({ success: true, progressData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//add user tating to course

export const addUserRating = async (req, res) => {
  const userId = req.auth.userId;
  const { courseId, rating } = req.body;
  if (!courseId || !userId || !rating < 1 || rating > 5) {
    return res.json({ success: false, message: "Invalid rating data" });
  }
  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.json({ success: false, message: "Course not found" });
    }
    const user = await User.findById(userId);
    if (!user || !user.enrolledCourses.includes(courseId)) {
      return res.json({
        success: false,
        message: "User not enrolled in course",
      });
    }
    const existingRating = course.ratings.findIndex(
      (rating) => rating.userId.toString() === userId
    );
    if (existingRating !== -1) {
      course.ratings[existingRating].rating = rating;
    } else {
      course.ratings.push({ userId, rating });
      await course.save();

      return res.json({ success: true, message: "Rating added successfully" });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
