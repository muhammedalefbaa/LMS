import React from "react";
import assets from "../../assets/assets";

export default function Footer() {
  return (
    <footer className="bg-gray-900 md:px-36 text-left w-full mt-10">
      <div className="flex flex-col md:flex-row items-center px-8 md:px-0 justify-center gap-10 md:gap-32 py-10 border-b border-white/30">
        <div className="flex flex-col md:items-start items-center w-full lg:h-85 md:h-110">
          <img src={assets.logo_dark} alt="logo" />
          <p className="mt-6 text-center md:text-left tes-sm text-white/80">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text.
          </p>
        </div>
        <div className="flex flex-col lg:items-start md:items-center items-center w-full lg:h-85 md:h-110">
          <h2 className="font-simibold text-white mb-9.5">company</h2>
          <ul className="flex flex-col lg:w-full  gap-2 lg:text-left text-center text-sm text-white/80 md:space-y-2 md:justify-space-between">
            <li>
              <a href="#">Home</a>
            </li>
            <li>
              <a href="#">About us</a>
            </li>
            <li>
              <a href="#">Contact us</a>
            </li>
            <li>
              <a href="#">Privacy policy</a>
            </li>
          </ul>
        </div>
        <div className="hidden md:flex flex-col md:items-start w-full lg:h-85 md:h-110 lg-items-start">
          <h2 className="font-simibold text-white mb-9.5">
            Subscribe to our newsletter
          </h2>
          <p className="text-sm text-white/80">
            The latest news, articles, and resources, sent to your inbox weekly.
          </p>
          <div className="flex items-center gap-2 pt-4">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="border border-gray-500/30 text-gray-500 placeholder-gray-500 outline-none w-64 h-9 rounded px-2 text-sm bg-gray-800"
            />
            <button className="bg-blue-600 text-white w-24 h-9 rounded">Subscribe</button>
          </div>
        </div>
      </div>
      <p className="py-4 text-center text-xs md:text-sm text-white/60">
        Copyright 2025 © Ilmora. All Right Reserved.
      </p>
    </footer>
  );
}
