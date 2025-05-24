import React from "react";
import assets from "../../assets/assets";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { Link } from "react-router-dom";

export default function CourseCard({ course }) {
  const { currency, calculateRating } = useContext(AppContext);

  return (
    <Link
      to={"/course/" + course._id}
      onClick={() => window.scrollTo(0, 0)}
      className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      <div className="aspect-video overflow-hidden">
        <img 
          src={course.courseThumbnail} 
          alt={course.courseTitle} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300" 
        />
      </div>
      <div className="p-3 sm:p-5 flex flex-col flex-grow">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
          {course.courseTitle}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          By{" "}
          <span className="text-gray-900 font-medium">
            {course.educator?.name || "Unknown Instructor"}
          </span>
        </p>
        
        <div className="flex items-center mt-2 sm:mt-3 space-x-1.5 sm:space-x-2">
          <span className="text-xs sm:text-sm font-medium text-gray-900">
            {calculateRating(course)}
          </span>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <img
                key={i}
                src={
                  i < Math.floor(calculateRating(course))
                    ? assets.star
                    : assets.star_blank
                }
                alt=""
                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
              />
            ))}
          </div>
          <span className="text-xs sm:text-sm text-gray-600">
            ({course.courseRatings.length})
          </span>
        </div>

        <div className="mt-3 sm:mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              {currency}
              {(
                course.coursePrice -
                (course.discount / 100) * course.coursePrice
              ).toFixed(2)}
            </span>
            {course.discount > 0 && (
              <span className="text-xs sm:text-sm text-gray-500 line-through">
                {currency}{course.coursePrice}
              </span>
            )}
          </div>
          {course.discount > 0 && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 sm:px-2.5 sm:py-1 rounded">
              {course.discount}% OFF
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
