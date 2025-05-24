import React from "react";
import assets from "../../assets/assets";

export default function CallToAction() {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
          Learn anything, anytime, anywhere
        </h2>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-8 sm:mb-10">
          Incididunt sint fugiat pariatur cupidatat consectetur sit cillum anim id
          veniam aliqua proident excepteur commodo do ea.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <button className="w-full max-w-[200px] sm:w-auto px-4 py-3 text-sm rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 font-medium">
            Get Started
          </button>
          <button className="w-full max-w-[200px] sm:w-auto px-4 py-3 text-sm rounded-lg flex items-center justify-center gap-2 text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium">
            Learn More 
            <img 
              src={assets.arrow_icon} 
              alt="arrow icon" 
              className="w-4 h-4"
            />
          </button>
        </div>
      </div>
    </section>
  );
}
