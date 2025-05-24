import React, { useState, useCallback, useContext } from "react";
import uniqid from "uniqid";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import assets from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const initialLectureDetails = {
  lectureTitle: "",
  lectureDuration: "",
  lectureUrl: "",
  isPreviewFree: false,
};

export default function AddCourse() {
  const [editorContent, setEditorContent] = useState('');
  const [formData, setFormData] = useState({
    courseTitle: "",
    coursePrice: 0,
    discount: 0,
    image: null,
  });
  const [chapters, setChapters] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [lectureDetails, setLectureDetails] = useState(initialLectureDetails);
  const navigate = useNavigate();
  const { addNewCourse } = useContext(AppContext);

  // Handle form input changes
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Chapter management
  const handleChapter = useCallback((action, chapterId) => {
    if (action === "add") {
      const title = prompt("Enter chapter name:");
      if (title) {
        setChapters(prev => [
          ...prev,
          {
            chapterId: uniqid(),
            chapterTitle: title,
            chapterContent: [],
            collapsed: false,
            chapterOrder: prev.length > 0 ? prev.slice(-1)[0].chapterOrder + 1 : 1,
          },
        ]);
      }
    } else if (action === "remove") {
      setChapters(prev => prev.filter(chapter => chapter.chapterId !== chapterId));
    } else if (action === "toggle") {
      setChapters(prev =>
        prev.map(chapter =>
          chapter.chapterId === chapterId
            ? { ...chapter, collapsed: !chapter.collapsed }
            : chapter
        )
      );
    }
  }, []);

  // Lecture management
  const handleLecture = useCallback((action, chapterId, lectureIndex) => {
    if (action === "add") {
      setCurrentChapterId(chapterId);
      setShowPopup(true);
    } else if (action === "remove") {
      setChapters(prev =>
        prev.map(chapter => {
          if (chapter.chapterId === chapterId) {
            return {
              ...chapter,
              chapterContent: chapter.chapterContent.filter((_, i) => i !== lectureIndex),
            };
          }
          return chapter;
        })
      );
    }
  }, []);

  // Add new lecture
  const addLecture = useCallback(() => {
    if (!currentChapterId) return;

    setChapters(prev =>
      prev.map(chapter => {
        if (chapter.chapterId === currentChapterId) {
          const newLecture = {
            ...lectureDetails,
            lectureOrder:
              chapter.chapterContent.length > 0
                ? chapter.chapterContent.slice(-1)[0].lectureOrder + 1
                : 1,
            lectureId: uniqid(),
          };
          return {
            ...chapter,
            chapterContent: [...chapter.chapterContent, newLecture],
          };
        }
        return chapter;
      })
    );

    setLectureDetails(initialLectureDetails);
    setShowPopup(false);
  }, [currentChapterId, lectureDetails]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.image) {
      console.error("Please upload a course thumbnail");
      return;
    }

    try {
      const courseData = {
        courseTitle: formData.courseTitle,
        coursePrice: formData.coursePrice,
        discount: formData.discount,
        courseDescription: editorContent,
        chapters,
      };
      
      console.log("Submitting course data:", courseData);
      const response = await addNewCourse(courseData, formData.image);
      console.log("Server response:", response);
      
      if (response.success) {
        toast.success("Course added successfully!");
        setTimeout(() => {
          navigate("/educator/my-courses");
        }, 2000);
      } else {
        console.error("Failed to add course:", response.message);
      }
    } catch (error) {
      console.error("Error adding course:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6"
      >
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Create New Course</h1>

        {/* Course Basic Info */}
        <div className="space-y-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Title
            </label>
            <input
              type="text"
              value={formData.courseTitle}
              onChange={e => handleInputChange("courseTitle", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Description
            </label>
            <ReactQuill
              value={editorContent}
              onChange={setEditorContent}
              className="h-48"
              theme="snow"
              modules={{
                toolbar: [
                  [{ header: [1, 2, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['link', 'image'],
                  ['clean']
                ]
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Price ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.coursePrice}
                onChange={e => handleInputChange("coursePrice", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discount}
                onChange={e => handleInputChange("discount", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Thumbnail
              </label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer">
                  <div className="p-2 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors">
                    <img src={assets.file_upload_icon} alt="Upload" className="h-6" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleInputChange("image", e.target.files[0])}
                    className="hidden"
                  />
                </label>
                {formData.image && (
                  <img
                    src={URL.createObjectURL(formData.image)}
                    alt="Preview"
                    className="h-10 rounded-md"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Course Content</h2>

          {chapters.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No chapters added yet. Click below to add your first chapter.
            </div>
          )}

          {chapters.map((chapter, index) => (
            <div key={chapter.chapterId} className="mb-4 border rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => handleChapter("toggle", chapter.chapterId)}
                    className="mr-3 text-gray-500 hover:text-gray-700"
                  >
                    <img
                      src={assets.dropdown_icon}
                      alt={chapter.collapsed ? "Expand" : "Collapse"}
                      className={`w-4 transition-transform ${chapter.collapsed ? "-rotate-90" : ""}`}
                    />
                  </button>
                  <span className="font-semibold">
                    Chapter {index + 1}: {chapter.chapterTitle}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {chapter.chapterContent.length} lecture(s)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleChapter("remove", chapter.chapterId)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <img src={assets.cross_icon} alt="Remove" className="w-4" />
                  </button>
                </div>
              </div>

              {!chapter.collapsed && (
                <div className="p-4 space-y-3">
                  {chapter.chapterContent.map((lecture, idx) => (
                    <div
                      key={lecture.lectureId || idx}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="font-medium">
                          {idx + 1}. {lecture.lectureTitle}
                        </p>
                        <div className="text-sm text-gray-500 mt-1">
                          <span>{lecture.lectureDuration} minutes</span>
                          {lecture.lectureUrl && (
                            <>
                              <span className="mx-2">•</span>
                              <a
                                href={lecture.lectureUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                View Content
                              </a>
                            </>
                          )}
                          <span className="mx-2">•</span>
                          <span>{lecture.isPreviewFree ? "Free Preview" : "Paid"}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleLecture("remove", chapter.chapterId, idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <img src={assets.cross_icon} alt="Remove" className="w-4" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => handleLecture("add", chapter.chapterId)}
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-700 text-sm font-medium mt-2"
                  >
                    <span>+ Add Lecture</span>
                  </button>
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => handleChapter("add")}
            className="w-full py-2 px-4 border border-dashed border-gray-300 rounded-md text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors flex justify-center items-center gap-2"
          >
            <span>+ Add Chapter</span>
          </button>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Save Course
          </button>
        </div>
      </form>

      {/* Add Lecture Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-semibold">Add New Lecture</h3>
              <button
                type="button"
                onClick={() => {
                  setLectureDetails(initialLectureDetails);
                  setShowPopup(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <img src={assets.cross_icon} alt="Close" className="w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lecture Title
                </label>
                <input
                  type="text"
                  value={lectureDetails.lectureTitle}
                  onChange={e =>
                    setLectureDetails({
                      ...lectureDetails,
                      lectureTitle: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={lectureDetails.lectureDuration}
                  onChange={e =>
                    setLectureDetails({
                      ...lectureDetails,
                      lectureDuration: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content URL
                </label>
                <input
                  type="url"
                  value={lectureDetails.lectureUrl}
                  onChange={e =>
                    setLectureDetails({
                      ...lectureDetails,
                      lectureUrl: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="previewFree"
                  checked={lectureDetails.isPreviewFree}
                  onChange={e =>
                    setLectureDetails({
                      ...lectureDetails,
                      isPreviewFree: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="previewFree" className="ml-2 block text-sm text-gray-700">
                  Available as free preview
                </label>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 flex justify-end border-t">
              <button
                type="button"
                onClick={addLecture}
                disabled={!lectureDetails.lectureTitle || !lectureDetails.lectureDuration}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
              >
                Add Lecture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}