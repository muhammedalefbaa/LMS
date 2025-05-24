/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import huminizeDuration from "humanize-duration";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const backUrl = import.meta.env.VITE_BACKEND_URL;
  const currency = import.meta.env.VITE_CURRENCY;

  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(false);
  const [enrollCourses, setEnrollCourses] = useState([]);
  const [enrollCoursesArray, setEnrollCoursesArray] = useState([]);
  const [userData, setUserData] = useState(null);

  const navigate = useNavigate();

  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();

  // Add new course
  const addNewCourse = async (courseData, image) => {
    try {
      const formData = new FormData();
      
      // Add the course thumbnail
      if (image) {
        formData.append('image', image);
      }

      // Convert course data to string and append
      const courseDataForSubmission = {
        courseTitle: courseData.courseTitle,
        coursePrice: parseFloat(courseData.coursePrice),
        discount: parseFloat(courseData.discount),
        courseDescription: courseData.courseDescription,
        chapters: courseData.chapters
      };

      formData.append('courseData', JSON.stringify(courseDataForSubmission));
      const token = await getToken();
      const response = await axios.post(`${backUrl}api/educator/add-course`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      if (error.response?.data) {
        if (typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE html>')) {
          const errorMatch = error.response.data.match(/<pre>(.*?)<br>/);
          throw { success: false, message: errorMatch ? errorMatch[1] : 'Server error occurred' };
        }
        throw error.response.data;
      }
      throw { success: false, message: 'Failed to add course' };
    }
  };

  // Get educator courses
  const getEducatorCourses = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(`${backUrl}api/educator/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch courses' };
    }
  };

  //feach all courses
  const fetchAllCourses = async () => {
    try {
      const { data } = await axios.get(backUrl + "api/course/all");
      if (data.success) {
        setAllCourses(data.courses);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  //feach user data
  const fetchUserData = async () => {
    if (user.publicMetadata.role === "educator") {
      setIsEducator(true);
    }
    try {
      const token = await getToken();

      const { data } = await axios.get(backUrl + "api/user/data", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setUserData(data.user);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // function to calculate rating
  const calculateRating = (course) => {
    if (!course.courseRatings || course.courseRatings.length === 0) {
      return 0;
    }

    let totalRating = 0;
    course.courseRatings.forEach((rating) => {
      totalRating += rating.rating;
    });

    return Math.floor(totalRating / course.courseRatings.length);
  };

  // function to calculate course chapter time
  const calculateCapterTime = (chapter) => {
    let time = 0;

    chapter.chapterContent?.forEach((lectuer) => {
      time += Number(lectuer.lectureDuration) || 0; // Ensure it's a number
    });

    return huminizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  // function to calculate course duration
  const calculateCourseDuration = (course) => {
    let time = 0;
    course.courseContent.map((chapter) =>
      chapter.chapterContent.map((lectuer) => (time += lectuer.lectureDuration))
    );
    return huminizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  //function to calculate no of lectuers in the course
  const calculateNoOfLectuers = (course) => {
    let totalLectuers = 0;
    course.courseContent.forEach((chapter) => {
      if (Array.isArray(chapter.chapterContent)) {
        totalLectuers += chapter.chapterContent.length;
      }
    });
    return totalLectuers;
  };

  // feach user enroll courses
  const feachUserEnrolledCourses = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get(backUrl + "api/user/enrolled-courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {

        setEnrollCourses(data.enrolledCourses.reverse());
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
    }
  };

  useEffect(() => {
    setEnrollCoursesArray(enrollCourses.map((course) => course._id));
  }, [enrollCourses]);

  useEffect(() => {
    fetchAllCourses();
  }, []);

  useEffect(() => {
    if (isLoaded && user) {
      const loadData = async () => {
        try {
          await fetchUserData();
          await feachUserEnrolledCourses();
        } catch {
          console.error("Error loading user data");
        }
      };
      loadData();
    }
  }, [isLoaded, user]);

  const value = {
    currency,
    allCourses,
    navigate,
    calculateRating,
    isEducator,
    setIsEducator,
    calculateCourseDuration,
    calculateNoOfLectuers,
    calculateCapterTime,
    enrollCourses,
    feachUserEnrolledCourses,
    backUrl,
    userData,
    setUserData,
    getToken,
    fetchAllCourses,
    fetchUserData,
    enrollCoursesArray,
    addNewCourse,
    getEducatorCourses
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
