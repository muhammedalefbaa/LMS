import express from "express";
import {
  getUserData,
  purchaseCourse,
  userEnrolledCourses,
  updateUserCourseProgress,
  getUserCourseProgress,
  addUserRating,
} from "../controllers/userController.js";

const userRoute = express.Router();

userRoute.get("/data", getUserData);
userRoute.get("/enrolled-courses", userEnrolledCourses);
userRoute.post("/purchase", purchaseCourse);

userRoute.post("update-course-progress", updateUserCourseProgress);
userRoute.post("get-progress",authMiddleware ,getUserCourseProgress);
userRoute.post("/add-rating", addUserRating);

export default userRoute;
