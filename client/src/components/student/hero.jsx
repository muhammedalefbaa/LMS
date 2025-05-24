import React from "react";
import assets from "../../assets/assets";
import SearchBar from "./SearchBar";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-cyan-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
            Empower your future with{" "}
            <span className="relative inline-block">
              courses designed to
              <span className="relative text-blue-600">
                fit your choice
                <img
                  src={assets.sketch}
                  alt="sketch"
                  className="absolute -bottom-4 md:-bottom-6 right-0 w-24 md:w-32 opacity-90"
                />
              </span>
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-6">
            <span className="hidden sm:inline">
              We bring together world-class instructors, interactive content, and a
              supportive community to help you achieve your personal and professional
              goals.
            </span>
            <span className="sm:hidden">
              We bring together world-class instructors to help you achieve your
              personal goals.
            </span>
          </p>

          <div className="mt-8 sm:mt-10 max-w-xl mx-auto px-4 sm:px-6">
            <SearchBar />
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-1/2 opacity-50">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-100/30"></div>
      </div>
    </section>
  );
}
