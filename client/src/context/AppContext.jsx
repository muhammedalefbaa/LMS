/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import huminizeDuration from "humanize-duration";
import { useAuth, useUser } from "@clerk/clerk-react";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const currency = import.meta.env.VITE_CURRENCY;

  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(true);
  const [enrollCourses, setEnrollCourses] = useState([]);

  const navigate = useNavigate();

  const { getToken } = useAuth();
  const { user } = useUser();

  //feach all courses
  const fetchAllCourses = async () => {
    setAllCourses(dummyCourses);
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

    return (totalRating / course.courseRatings.length).toFixed(1);
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
    setEnrollCourses(dummyCourses);
  };

  useEffect(() => {
    fetchAllCourses();
    feachUserEnrolledCourses();
  }, []);

  const logToken = async () => {
    console.log("Bearer "+ await getToken());
  };

  useEffect(() => {
    if (user) {
      logToken();
    }
  }, [user]);

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
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
