import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { Line } from "rc-progress";
import Footer from "../../components/student/Footer";
import axios from "axios";
import Loading from "../../components/student/Loading";

export default function MyEnrollment() {
  const {
    enrollCourses,
    calculateCourseDuration,
    navigate,
    userData,
    fetchUserEnrolledCourses,
    backUrl,
    getToken,
    calculateNoOfLectuers,
  } = useContext(AppContext);
  const [progressArray, setProgressArray] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getProgress = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(
        backUrl + "api/user/course-progress",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (data.success) {
        console.log("📦 Course progress data:", data);
        const tempProgressArray = enrollCourses.map((course) => {
          const progressData = data.progressData.find(
            (item) => item.courseId === course._id
          );
          
          if (progressData) {
            return {
              percentage: Math.floor(
                (progressData.lectuerCompleted.length /
                  calculateNoOfLectuers(course)) *
                  100
              ),
              lecturesCompleted: progressData.lectuerCompleted.length,
              totalLectures: calculateNoOfLectuers(course),
            };
          }
          return {
            percentage: 0,
            lecturesCompleted: 0,
            totalLectures: calculateNoOfLectuers(course),
          };
        });
        setProgressArray(tempProgressArray);
      }
    } catch (error) {
      console.error("❌ Error fetching progress:", error);
      setError("Failed to load course progress");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadEnrollments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        if (userData) {
          console.log("🔄 Fetching enrolled courses...");
          await fetchUserEnrolledCourses();
        }
      } catch (error) {
        console.error("❌ Error loading enrollments:", error);
        setError("Failed to load enrolled courses");
      }
    };
    loadEnrollments();
  }, [userData]);

  useEffect(() => {
    if (enrollCourses.length > 0) {
      getProgress();
    } else {
      setIsLoading(false);
    }
  }, [enrollCourses]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  if (!enrollCourses.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-xl text-gray-600 mb-4">You haven't enrolled in any courses yet</p>
        <button
          onClick={() => navigate('/course-list')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Browse Courses
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="md:px-36 px-8 pt-10 bg-gradient-to-b from-cyan-100/70 z-1">
        <h1 className="text-2xl font-semibold">My Enrollments</h1>
        <table className="md:table-auto table-fixed w-full overflow-hidden border  border-gray-500 mt-10">
          <thead className="text-gray-900 border-b border-gray-500/200 text-sm text-left max-sm:hidden">
            <tr>
              <th className="px-4 py-3 font-semibold truncate">Course</th>
              <th className="px-4 py-3 font-semibold truncate">Duration</th>
              <th className="px-4 py-3 font-semibold truncate">Completed</th>
              <th className="px-4 py-3 font-semibold truncate">Status</th>
            </tr>
          </thead>
          <tbody className="text-gray-600">
            {Array.isArray(enrollCourses) &&
              enrollCourses.map((course, index) => (
                <tr
                  key={index}
                  className="border-t border-gray-200 flex flex-col sm:table-row sm:border-t-0 sm:border-b sm:border-gray-200 sm:table w-full"
                >
                  <td className="px-4 py-3 flex sm:table-cell sm:px-4 sm:py-3 items-start sm:items-center space-x-0 sm:space-x-3 flex-col sm:flex-row">
                    <img
                      src={course.courseThumbnail}
                      alt={course.courseTitle}
                      className="rounded object-cover  sm:w-28 sm:h-20 mb-2 sm:mb-0"
                    />
                    <div className="flex-1">
                      <p className="text-sm truncate max-w-[200px] sm:max-w-full font-medium">
                        {course.courseTitle}
                      </p>
                      <Line
                        strokeWidth={2}
                        percent={progressArray[index]?.percentage || 0}
                        className="bg-gray-300 rounded-full mt-1"
                      />
                    </div>
                  </td>

                  <td className="px-4 py-2 sm:table-cell sm:px-4 sm:py-3 text-sm">
                    {calculateCourseDuration(course)}
                  </td>

                  <td className="px-4 py-2 sm:table-cell sm:px-4 sm:py-3 text-sm">
                    {progressArray[index] &&
                      `${progressArray[index].lecturesCompleted} / ${progressArray[index].totalLectures}`}{" "}
                    <span className="text-xs text-gray-500">lectures</span>
                  </td>

                  <td className="px-4 py-2 sm:table-cell sm:px-4 sm:py-3 text-sm text-right sm:text-left">
                    <button
                      className={`text-white text-xs px-3 py-1 rounded cursor-pointer ${
                        progressArray[index] &&
                        progressArray[index].lecturesCompleted ===
                          progressArray[index].totalLectures
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}
                      onClick={() => navigate(`/player/${course._id}`)}
                    >
                      {progressArray[index] &&
                      progressArray[index].lecturesCompleted ===
                        progressArray[index].totalLectures
                        ? "Completed"
                        : "Continue"}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <Footer />
    </>
  );
}
