import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { useParams } from "react-router-dom";
import assets from "../../assets/assets";
import humanizeDuration from "humanize-duration";
import YouTube from "react-youtube";
import Footer from "../../components/student/Footer";
import Rating from "../../components/student/Rating";

export default function Player() {
  const { enrollCourses, calculateCapterTime } = useContext(AppContext);
  const { courseId } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [openSection, setOpenSection] = useState({});
  const [playerData, setPlayerData] = useState(null);

  const getCourseData = () => {
    if (!enrollCourses) return;

    const foundCourse = enrollCourses.find((course) => course._id === courseId);
    if (foundCourse) {
      setCourseData(foundCourse);
    }
  };

  const toggleSection = (index) => {
    setOpenSection((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  useEffect(() => {
    getCourseData();
  }, [enrollCourses]);

  return (
    <div>
      <div className="p-4 sm:p-10 sm:flex sm:flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36">
        {/* right column (video) */}
        <div className="md:mt-10 order-1 md:order-2">
          {playerData ? (
            <div>
              <YouTube
                key={playerData.lectureUrl} // this forces re-render
                videoId={playerData.lectureUrl.split("/").pop()}
                iframeClassName="w-full aspect-video"
              />
              <div className="flex items-center justify-between mt-1">
                <p>
                  {playerData.chapter}.{playerData.lecture}{" "}
                  {playerData.lectureTitle}
                </p>
                <button className="text-blue-600 cursor-pointer">
                  {false ? "complete" : "Mark As Complete"}
                </button>
              </div>
            </div>
          ) : (
            <img src={courseData ? courseData.courseThumbnail : null} alt="" />
          )}
        </div>

        {/* left column (course structure) */}
        <div className="text-gray-800 order-2 md:order-1">
          <h2 className="text-xl font-semibold">Course Structure</h2>
          <div className="pt-5">
            {courseData &&
              courseData.courseContent.map((chapter, index) => (
                <div
                  key={index}
                  className="border border-gray-300 bg-white mb-2 rounded"
                >
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                    onClick={() => toggleSection(index)}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={assets.down_arrow_icon}
                        alt="arrow icon"
                        className={`w-4 h-4 transform transition-transform duration-300 ${
                          openSection[index] ? "rotate-180" : ""
                        }`}
                      />
                      <p className="font-medium md:text-base text-sm">
                        {chapter.chapterTitle}
                      </p>
                    </div>
                    <p className="text-sm md:text-default">
                      {chapter.chapterContent.length} lectures -{" "}
                      {calculateCapterTime(chapter)}
                    </p>
                  </div>

                  <div
                    className={`overflow-hidden transition-all ease-in-out duration-300  ${
                      openSection[index] ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
                      {chapter.chapterContent.map((lecture, i) => (
                        <li key={i} className="flex items-start gap-2 py-1">
                          <img
                            src={
                              false ? assets.blue_tick_icon : assets.play_icon
                            }
                            alt="play"
                            className={`w-5 h-5 transform transition-transform duration-300 ${
                              openSection[index] ? "rotate-180" : ""
                            }`}
                          />
                          <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                            <p>{lecture.lectureTitle}</p>
                            <div className="flex gap-2">
                              {lecture.lectureUrl && (
                                <p
                                  className="text-blue-500 cursor-pointer"
                                  onClick={() =>
                                    setPlayerData({
                                      ...lecture,
                                      chapter: index + 1,
                                      lecture: i + 1,
                                    })
                                  }
                                >
                                  Watch
                                </p>
                              )}
                              <p>
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
          <div className="flex items-center gap-2 py-3 mt-10">
            <h1 className="text-xl font-bold">Rate this course:</h1>
            <Rating initialRating={0} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
