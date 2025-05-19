import express from "express";
import {
  getUserData,
  purchaseCourse,
  userEnrolledCourses,
} from "../controllers/userController.js";

const userRoute = express.Router();

userRoute.get("/data", getUserData);
userRoute.get("/enrolled-courses", userEnrolledCourses);
userRoute.post("/purchase", purchaseCourse);

export default userRoute;
