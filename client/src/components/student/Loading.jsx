import React from "react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center w-full h-70">
      <div
        className="w-16 sm:w-20 aspect-square border-4 border-gray-300 border-t-4 
            border-t-blue-400 rounded-full animate-spin"
      ></div>
    </div>
  );
}
