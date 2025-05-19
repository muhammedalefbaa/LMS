import express from "express";
import {
  updateRoleToEducatoer,
  addCourse,
  getEducatorCourses,
  educationDashboardData,
  getEnrolledStudentsData,
} from "../controllers/educatorController.js";
import upload from "../configs/multer.js";
import protectEducator from "../middlewares/authMiddleware.js";

const educatorRoute = express.Router();

//add educator role
educatorRoute.get("/update-role", updateRoleToEducatoer);

educatorRoute.post(
  "/add-course",
  upload.single("image"),
  protectEducator,
  addCourse
);

educatorRoute.get("/courses", protectEducator, getEducatorCourses);
educatorRoute.get("/dahsbard", protectEducator, educationDashboardData);
educatorRoute.get(
  "/enrolled-students",
  protectEducator,
  getEnrolledStudentsData
);

export default educatorRoute;
