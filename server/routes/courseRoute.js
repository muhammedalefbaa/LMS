import express from "express";
import { getAllCourses, getCourseById } from "../controllers/courseController.js";



const courseRoute = express.Router();

courseRoute.get("/all",getAllCourses)
courseRoute.get("/:id",getCourseById)



export default courseRoute