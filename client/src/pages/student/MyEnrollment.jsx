import React, { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { Line } from "rc-progress";
import Footer from "../../components/student/Footer";

export default function MyEnrollment() {
  const { enrollCourses, calculateCourseDuration, navigate } =
    useContext(AppContext);
  const [progressArray, setProgressArray] = useState([
    { lectuerCompleted: 2, totalLectuers: 10 },
    { lectuerCompleted: 4, totalLectuers: 10 },
    { lectuerCompleted: 3, totalLectuers: 10 },
    { lectuerCompleted: 6, totalLectuers: 10 },
    { lectuerCompleted: 7, totalLectuers: 10 },
    { lectuerCompleted: 5, totalLectuers: 10 },
    { lectuerCompleted: 4, totalLectuers: 10 },
    { lectuerCompleted: 10, totalLectuers: 10 },
  ]);
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
                        percent={
                          (progressArray[index].lectuerCompleted /
                            progressArray[index].totalLectuers) *
                          100
                        }
                        className="bg-gray-300 rounded-full mt-1"
                      />
                    </div>
                  </td>

                  <td className="px-4 py-2 sm:table-cell sm:px-4 sm:py-3 text-sm">
                    {calculateCourseDuration(course)}
                  </td>

                  <td className="px-4 py-2 sm:table-cell sm:px-4 sm:py-3 text-sm">
                    {progressArray[index] &&
                      `${progressArray[index].lectuerCompleted} / ${progressArray[index].totalLectuers}`}{" "}
                    <span className="text-xs text-gray-500">lectures</span>
                  </td>

                  <td className="px-4 py-2 sm:table-cell sm:px-4 sm:py-3 text-sm text-right sm:text-left">
                    <button
                      className={`text-white text-xs px-3 py-1 rounded cursor-pointer ${
                        progressArray[index].lectuerCompleted ===
                        progressArray[index].totalLectuers
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}
                      onClick={() => navigate(`/player/${course._id}`)}
                    >
                      {progressArray[index].lectuerCompleted ===
                      progressArray[index].totalLectuers
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
