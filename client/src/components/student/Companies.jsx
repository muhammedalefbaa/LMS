import React from "react";
import assets from "../../assets/assets";

export default function Companies() {
  return (
    <div className="py-16">
      <div className="text-center">
        <p className="text-lg text-gray-600 mb-10">Trusted by learners from</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16">
        <img
          src={assets.microsoft_logo}
          alt="microsoft logo"
          className="w-20 md:w-28 opacity-80 hover:opacity-100 transition-opacity"
        />
        <img
          src={assets.walmart_logo}
          alt="walmart logo"
          className="w-20 md:w-28 opacity-80 hover:opacity-100 transition-opacity"
        />
        <img
          src={assets.accenture_logo}
          alt="accenture logo"
          className="w-20 md:w-28 opacity-80 hover:opacity-100 transition-opacity"
        />
        <img
          src={assets.adobe_logo}
          alt="adobe logo"
          className="w-20 md:w-28 opacity-80 hover:opacity-100 transition-opacity"
        />
        <img
          src={assets.paypal_logo}
          alt="paypal logo"
          className="w-20 md:w-28 opacity-80 hover:opacity-100 transition-opacity"
        />
      </div>
    </div>
  );
}
