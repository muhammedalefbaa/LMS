import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import SearchBar from "../../components/student/SearchBar";
import { useParams } from "react-router-dom";
import CourseCard from "../../components/student/CourseCard";
import assets from "../../assets/assets";
import Footer from "../../components/student/Footer";
import Loading from "../../components/student/Loading";

export default function CoursesList() {
  const { navigate, allCourses } = useContext(AppContext);
  const { input } = useParams();
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (allCourses?.length > 0) {
      const filtered = input
        ? allCourses.filter((item) =>
            item.courseTitle.toLowerCase().includes(input.toLowerCase())
          )
        : allCourses;
      setFilteredCourses(filtered);
    }
    setIsLoading(false);
  }, [allCourses, input]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <div className="relative px-4 md:px-24 lg:px-36 pt-20 text-left">
        {/* Header and Search */}
        <div className="flex flex-col lg:flex-row justify-between gap-6 items-center lg:items-start">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-800">Course List</h1>
            <p className="text-gray-500">
              <span
                className="text-blue-600 cursor-pointer"
                onClick={() => navigate("/")}
              >
                Home
              </span>{" "}
              / <span>Course List</span>
            </p>
          </div>
          <SearchBar data={input} />
        </div>

        {/* Filter Tag */}
        {input && (
          <div className="inline-flex items-center gap-4 px-4 py-2 border border-gray-300 rounded mt-8 text-gray-500 mx-auto md:mx-0">
            <p className="truncate max-w-xs">{input}</p>
            <img
              src={assets.cross_icon}
              alt="Clear filter"
              className="cursor-pointer w-4 h-4"
              onClick={() => navigate("/course-list")}
            />
          </div>
        )}

        {/* Course Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-16">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course, index) => (
              <CourseCard key={course._id || index} course={course} />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-8">
              {input ? (
                <p>No courses found matching "{input}"</p>
              ) : (
                <p>No courses available at the moment</p>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
