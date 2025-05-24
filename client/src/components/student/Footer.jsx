import React from "react";
import assets from "../../assets/assets";

export default function Footer() {
  return (
    <footer className="bg-gray-900 w-full mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 py-16 border-b border-white/10">
          {/* Logo and Description */}
          <div className="flex flex-col items-center md:items-start">
            <img src={assets.logo_dark} alt="logo" className="h-8" />
            <p className="mt-6 text-center md:text-left text-sm text-gray-400 leading-relaxed max-w-md">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text.
            </p>
          </div>

          {/* Company Links */}
          <div className="flex flex-col items-center md:items-start">
            <h2 className="font-semibold text-white text-lg mb-6">Company</h2>
            <ul className="flex flex-col items-center md:items-start gap-3 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  About us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Contact us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Privacy policy
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="hidden lg:flex flex-col items-center md:items-start">
            <h2 className="font-semibold text-white text-lg mb-6">
              Subscribe to our newsletter
            </h2>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              The latest news, articles, and resources, sent to your inbox weekly.
            </p>
            <form className="w-full">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="min-w-0 flex-1 bg-gray-800 border border-gray-700 text-gray-300 placeholder-gray-500 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <button 
                  type="submit"
                  className="whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-200"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="py-8 text-center">
          <p className="text-sm text-gray-400">
            Copyright 2025 © Ilmora. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
