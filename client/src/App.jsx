import React from "react";
import { Route, Routes, useMatch } from "react-router-dom";
import Home from "./pages/student/Home";
import CourseList from "./pages/student/CoursesList";
import MyEnrollment from "./pages/student/MyEnrollment";
import Player from "./pages/student/Player";
import Loading from "./components/student/Loading";
import Educator from "./pages/educator/Educator";
import Dashboard from "./pages/educator/Dashboard";
import AddCourse from "./pages/educator/AddCourse";
import MyCourses from "./pages/educator/MyCourses";
import StudentsEnrolled from "./pages/educator/StudentsEnrolled";
import Navbar from "./components/student/Navbar";
import CourseDetails from "./pages/student/CourseDetails";
import "quill/dist/quill.snow.css"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
    const isEducatorRoute = useMatch("/educator/*");

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            {!isEducatorRoute && <Navbar />}
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/course-list" element={<CourseList />} />
                    <Route path="/course-list/:input" element={<CourseList />} />
                    <Route path="/my-enrollment" element={<MyEnrollment />} />
                    <Route path="/course/:id" element={<CourseDetails />} />
                    <Route path="/player/:courseId" element={<Player />} />
                    <Route path="/loading/:path" element={<Loading />} />

                    <Route path="/educator" element={<Educator />}>
                        <Route path="/educator" element={<Dashboard />} />
                        <Route path="add-course" element={<AddCourse />} />
                        <Route path="my-courses" element={<MyCourses />} />
                        <Route path="students-enrolled" element={<StudentsEnrolled />} />
                    </Route>
                </Routes>
            </main>
        </div>
    );
}
