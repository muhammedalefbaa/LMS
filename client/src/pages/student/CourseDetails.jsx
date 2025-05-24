import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/student/Loading";
import assets from "../../assets/assets";
import Footer from "../../components/student/Footer";
import humanizeDuration from "humanize-duration";
import YouTube from "react-youtube";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";

export default function CourseDetails() {
  const { id } = useParams();
  const { user: clerkUser } = useUser();
  const [courseData, setCourseData] = useState(null);
  const [openSection, setOpenSetion] = useState({});
  const [isAlreadyEnrolled, setAlreadyEnrolled] = useState(false);
  const [playerData, setPlayerData] = useState(null);

  const {
    calculateRating,
    calculateCourseDuration,
    calculateNoOfLectuers,
    calculateCapterTime,
    currency,
    backUrl,
    userData,
    getToken,
    enrollCoursesArray,
    feachUserEnrolledCourses,
  } = useContext(AppContext);

  const fetchCourseData = async () => {
    try {
      const { data } = await axios.get(backUrl + `api/course/${id}`);
      if (data.success) {
        setCourseData(data.courseData);
      }
    } catch (error) {
      console.error("Error fetching course data:", error);
    }
  };

  const enrollCourse = async () => {
    if (!clerkUser || !courseData?._id || enrollCoursesArray.includes(courseData._id)) {
      return;
    }

    try {
      const token = await getToken();
      const { data } = await axios.post(
        backUrl + "api/user/purchase",
        { courseId: courseData._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success && data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error during enrollment:", error);
    }
  };

  useEffect(() => {
    fetchCourseData();
    if (clerkUser) {
      feachUserEnrolledCourses();
    }
  }, [clerkUser]);

  useEffect(() => {
    if (courseData && (userData?.enrolledCourses || enrollCoursesArray)) {
      const isEnrolled = 
        (userData?.enrolledCourses?.includes(courseData._id) || 
        enrollCoursesArray?.includes(courseData._id)) ?? false;
      setAlreadyEnrolled(isEnrolled);
    }
  }, [userData, courseData, enrollCoursesArray]);

  const toggleSection = (index) => {
    setOpenSetion((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div>
      <div className="flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-8 lg:px-36 px-4 md:pt-32 pt-24 text-left">
        <div className="absolute top-0 left-0 w-full h-[400px] z-1 bg-gradient-to-b from-cyan-50 via-cyan-100/40 to-transparent"></div>

        {courseData ? (
          <>
            {/* left column */}
            <div className="max-w-2xl z-10 text-gray-600">
              <h1 className="md:text-4xl text-3xl font-bold text-gray-800 leading-tight">
                {courseData.courseTitle}
              </h1>
              <p
                className="pt-4 md:text-lg text-base leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: courseData.courseDescription.slice(0, 200),
                }}
              ></p>
              {/* course rating */}
              <div className="flex flex-wrap items-center gap-4 pt-4 pb-2 text-sm">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{calculateRating(courseData)}</p>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <img
                        key={i}
                        src={
                          i < Math.floor(calculateRating(courseData))
                            ? assets.star
                            : assets.star_blank
                        }
                        alt=""
                        className="w-4 h-4"
                      />
                    ))}
                  </div>
                </div>
                <p className="text-blue-600 hover:text-blue-700 transition-colors">
                  ({courseData.courseRatings.length}
                  {courseData.courseRatings.length > 1 ? " Ratings" : " Rating"}
                  )
                </p>
                <p className="text-gray-700">
                  {courseData.enrolledStudents.length}
                  {courseData.enrolledStudents.length > 1
                    ? " Students"
                    : " Student"}
                </p>
              </div>
              <p className="text-gray-700">
                Course by{" "}
                <span className="text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">
                  {courseData.educator?.name || "Unknown Instructor"}
                </span>
              </p>

              <div className="pt-12 text-gray-800">
                <h2 className="text-2xl font-bold mb-6">Course Structure</h2>
                <div className="space-y-3">
                  {courseData.courseContent.map((chapter, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div
                        className="flex items-center justify-between px-6 py-4 cursor-pointer select-none hover:bg-gray-50 transition-colors"
                        onClick={() => toggleSection(index)}
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={assets.down_arrow_icon} 
                            alt="arrow icon"
                            className={`w-4 h-4 transform transition-transform duration-300 ${
                              openSection[index] ? 'rotate-180' : ''
                            }`}
                          />
                          <p className="font-semibold md:text-lg">
                            {chapter.chapterTitle}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600">
                          {chapter.chapterContent.length} lectures •{" "}
                          {calculateCapterTime(chapter)}
                        </p>
                      </div>

                      <div
                        className={`overflow-hidden transition-all ease-in-out duration-300 ${
                          openSection[index] ? "max-h-[500px]" : "max-h-0"
                        }`}
                      >
                        <ul className="px-6 py-3 space-y-2 text-gray-700 border-t border-gray-100 bg-gray-50">
                          {chapter.chapterContent.map((lecture, i) => (
                            <li key={i} className="flex items-center gap-3">
                              <img
                                src={assets.play_icon}
                                alt="play"
                                className="w-4 h-4 opacity-80"
                              />
                              <div className="flex items-center justify-between w-full">
                                <p className="text-sm md:text-base">{lecture.lectureTitle}</p>
                                <div className="flex items-center gap-4">
                                  {lecture.isPreviewFree && (
                                    <button
                                      className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                                      onClick={() =>
                                        setPlayerData({
                                          videoId: lecture.lectureUrl
                                            .split("/")
                                            .pop(),
                                        })
                                      }
                                    >
                                      Preview
                                    </button>
                                  )}
                                  <p className="text-sm text-gray-500">
                                    {humanizeDuration(
                                      lecture.lectureDuration * 60 * 1000,
                                      { units: ["h", "m"] }
                                    )}
                                  </p>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-16">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Course Description
                </h3>
                <div
                  className="prose prose-lg max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{
                    __html: courseData.courseDescription,
                  }}
                ></div>
              </div>
            </div>

            {/* right column */}
            <div className="md:top-24 max-w-[434px] z-10 shadow-lg rounded-xl overflow-hidden bg-white min-w-[300px] sm:min-w-[420px]">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {playerData ? (
                  <YouTube
                    videoId={playerData.videoId}
                    opts={{
                      playerVars: {
                        autoplay: 1,
                      },
                    }}
                    iframeClassName="w-full aspect-video"
                  />
                ) : (
                  <img src={courseData.courseThumbnail} alt="" />
                )}
                <div className="pt-5">
                  <div className="flex items-center gap-2">
                    <img
                      className="w-3.5"
                      src={assets.time_clock_icon}
                      alt="clock"
                    />

                    <p className="text-red-500">
                      <span className="font-medium">5 days </span>left at this
                      price !
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <p className="text-gray-800 md:text-4xl text-2xl font-semibold">
                      {currency}
                      {(
                        courseData.coursePrice -
                        (courseData.discount / 100) * courseData.coursePrice
                      ).toFixed(2)}
                    </p>
                    <p className="md:text-lg text-gray-500 line-through">
                      {currency}
                      {courseData.coursePrice}
                    </p>
                    <p className="md:text-lg text-gray-500">
                      {courseData.discount}% off
                    </p>
                  </div>
                  <div className="flex items-center text-sm md:text-default gap-4 pt-2 md:pt-4 text-gray-500">
                    <div className="flex items-center gap-1">
                      <img src={assets.star} alt="star" />
                      <p>{calculateRating(courseData)}</p>
                    </div>
                    <div className="h-4 w-px bg-gray-500/40"></div>

                    <div className="flex items-center gap-1">
                      <img src={assets.time_clock_icon} alt="time" />
                      <p>{calculateCourseDuration(courseData)}</p>
                    </div>
                    <div className="h-4 w-px bg-gray-500/40"></div>
                    <div className="flex items-center gap-1">
                      <img src={assets.lesson_icon} alt="time" />
                      <p>{calculateNoOfLectuers(courseData)} lessons</p>
                    </div>
                  </div>
                  <button
                    className={`md:mt-6 mt-4 w-full py-3 rounded text-white font-medium ${
                      !clerkUser 
                        ? 'bg-blue-400 cursor-not-allowed opacity-75' 
                        : isAlreadyEnrolled
                          ? 'bg-green-600 cursor-not-allowed'
                          : 'bg-blue-600 cursor-pointer hover:bg-blue-700'
                    }`}
                    onClick={enrollCourse}
                    disabled={!clerkUser || isAlreadyEnrolled}
                  >
                    {!clerkUser 
                      ? "Please Login" 
                      : isAlreadyEnrolled 
                        ? "Already Enrolled" 
                        : "Enroll Now"
                    }
                  </button>
                  <div className="pt-6">
                    <p className="md:text-xl text-lg font-medium text-gray-800">
                      What's in the course?
                    </p>
                    <ul className="ml-4 pt-2 text-sm md:text-base text-gray-600 list-disc">
                      <li>Lifetime access with free updates.</li>
                      <li>Step-by-step, hands-on project guidance.</li>
                      <li>Downloadable resources and source code.</li>
                      <li>Quizzes to test your knowledge.</li>
                      <li>Certificate of completion.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <Loading />
        )}
      </div>
      <Footer />
    </div>
  );
}
