import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function Loading() {
  const { path } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (path) {
      const timer = setTimeout(() => {
        navigate(`/${path}`);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="flex items-center justify-center w-full h-full min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-16 sm:w-20 aspect-square border-4 border-gray-300 border-t-blue-600 
          rounded-full animate-spin"
        ></div>
        <p className="text-gray-500 text-sm sm:text-base animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
