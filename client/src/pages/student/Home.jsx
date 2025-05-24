import React from "react";
import Hero from "../../components/student/hero";
import Companies from "../../components/student/Companies";
import CourseSection from "../../components/student/CourseSection";
import TestimonialSection from "../../components/student/TestimonialSection";
import CallToAction from "../../components/student/CallToAction";
import Footer from "../../components/student/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <div className="space-y-16 sm:space-y-20 md:space-y-24">
        <Companies />
        <CourseSection />
        <TestimonialSection />
        <CallToAction />
      </div>
      <Footer />
    </div>
  );
}
