import React, { useState } from "react";
import assets from "../../assets/assets";
import { useNavigate } from "react-router-dom";

export default function SearchBar({ data }) {
  const navigate = useNavigate();
  const [input, setInput] = useState(data ? data : "");

  const onSearchHandler = (e) => {
    e.preventDefault();
    navigate("/course-list/" + input);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form
        onSubmit={onSearchHandler}
        className="flex items-center h-12 sm:h-14 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 transition-colors duration-200"
      >
        <div className="flex-shrink-0 pl-4">
          <img
            src={assets.search_icon}
            alt="search icon"
            className="w-5 h-5 text-gray-400"
          />
        </div>
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder="Search for courses"
          className="flex-1 h-full px-4 text-base text-gray-900 placeholder-gray-500 bg-transparent border-0 outline-none focus:ring-0"
        />
        <button
          type="submit"
          className="flex-shrink-0 h-full px-6 sm:px-8 text-sm sm:text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-r-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Search
        </button>
      </form>
    </div>
  );
}
