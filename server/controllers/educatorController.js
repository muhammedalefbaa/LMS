import { clerkClient } from "@clerk/express";
import { v2 as cloudinary } from "cloudinary";
import Course from "../models/course.js";
import Purchase from "../models/purchase.js";
import User from "../models/user.js";
//update role to educator
export const updateRoleToEducatoer = async (req, res) => {
  try {
    const userId = req.auth.userId;

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "educator",
      },
    });
    res.json({ success: true, message: "Now you can add courses" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// add new course

export const addCourse = async (req, res) => {
  try {
    const { courseData } = req.body;
    const imageFile = req.file;
    const educatorId = req.auth.userId;

    if (!imageFile) {
      return res.json({ success: false, message: "Thumbnail is not attached" });
    }

    const parsedCourseData = await JSON.parse(courseData);
    parsedCourseData.educator = educatorId;

    // Upload image to Cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path);

    // Add the uploaded image URL to courseData
    parsedCourseData.courseThumbnail = imageUpload.secure_url;

    // Create the new course with the courseData, including the thumbnail
    const newCourse = await Course.create(parsedCourseData);

    res.json({ success: true, message: "Course added successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//get educator all courses

export const getEducatorCourses = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const courses = await Course.find({ educator: educator });

    res.json({ success: true, courses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// get educator dashboard data
export const getDashboardData = async (req, res) => {
  try {
    const educator = req.auth.userId;
    
    // Get all published courses by the educator
    const courses = await Course.find({ 
      educator,
      isPublished: true 
    });
    
    // Calculate total courses (published only)
    const totalCourses = courses.length;

    // Calculate total enrollments and earnings
    let totalEnrollments = 0;
    let totalEarnings = 0;

    courses.forEach(course => {
      // Count enrollments for this course
      const courseEnrollments = course.enrolledStudents ? course.enrolledStudents.length : 0;
      totalEnrollments += courseEnrollments;

      // Calculate earnings for this course
      const priceAfterDiscount = course.coursePrice - (course.discount * course.coursePrice / 100);
      const courseEarnings = courseEnrollments * priceAfterDiscount;
      totalEarnings += courseEarnings;
    });

    // Get enrolled students data with course details
    const enrolledStudentsData = await Promise.all(
      courses.map(async (course) => {
        const students = await User.find(
          {
            _id: { $in: course.enrolledStudents || [] }
          },
          "name imageUrl"
        );

        return students.map(student => ({
          student: {
            _id: student._id,
            name: student.name,
            imageUrl: student.imageUrl
          },
          courseTitle: course.courseTitle,
          coursePrice: course.coursePrice,
          priceAfterDiscount: course.coursePrice - (course.discount * course.coursePrice / 100),
          enrollmentDate: course.createdAt
        }));
      })
    );

    // Flatten the array and sort by enrollment date
    const flattenedEnrollments = enrolledStudentsData
      .flat()
      .sort((a, b) => new Date(b.enrollmentDate) - new Date(a.enrollmentDate))
      .slice(0, 10); // Get only the latest 10 enrollments

    res.json({
      success: true,
      dashboardData: {
        totalCourses,
        totalEnrollments,
        totalEarnings,
        enrolledStudentsData: flattenedEnrollments
      }
    });
  } catch (error) {
    console.error("Dashboard data error:", error);
    res.json({ success: false, message: error.message });
  }
};

//get enrolled student data with purchase data
export const getEnrolledStudentsData = async (req, res) => {
  try {
    const educator = req.auth.userId;
    
    // Get all courses by the educator with full details
    const courses = await Course.find({ educator }).select('courseTitle coursePrice discount');
    
    if (!courses || courses.length === 0) {
      return res.json({
        success: true,
        enrolledStudents: []
      });
    }

    const coursesIds = courses.map(course => course._id);

    // Get all completed purchases for the educator's courses
    const purchases = await Purchase.find({
      courseId: { $in: coursesIds },
      status: "completed"
    })
    .populate({
      path: "userId",
      model: "User",
      select: "name imageUrl email"
    })
    .populate({
      path: "courseId",
      model: "Course",
      select: "courseTitle coursePrice discount"
    })
    .lean(); // Convert to plain JavaScript objects

    // Create a map to store student totals and their enrollments
    const studentMap = new Map();

    for (const purchase of purchases) {
      if (!purchase.userId || !purchase.courseId) continue;

      const studentId = purchase.userId._id;
      const course = purchase.courseId;
      
      // Calculate the actual amount paid
      const priceAfterDiscount = course.coursePrice - (course.discount * course.coursePrice / 100);

      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          student: {
            _id: purchase.userId._id,
            name: purchase.userId.name,
            imageUrl: purchase.userId.imageUrl,
            email: purchase.userId.email
          },
          totalAmount: 0,
          enrollments: []
        });
      }

      const studentData = studentMap.get(studentId);
      studentData.totalAmount += priceAfterDiscount;
      studentData.enrollments.push({
        courseId: course._id,
        courseTitle: course.courseTitle,
        enrollmentDate: purchase.createdAt,
        amount: priceAfterDiscount
      });
    }

    // Convert map to array and sort by total amount
    const enrolledStudents = Array.from(studentMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount);

    console.log('Enrolled Students Data:', JSON.stringify({
      totalStudents: enrolledStudents.length,
      sampleStudent: enrolledStudents[0]
    }, null, 2));

    res.json({
      success: true,
      enrolledStudents
    });
  } catch (error) {
    console.error("Error fetching enrolled students:", error);
    res.json({ 
      success: false, 
      message: error.message || "Failed to fetch enrolled students" 
    });
  }
};
