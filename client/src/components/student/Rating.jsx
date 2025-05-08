import React, { useEffect, useState } from "react";

export default function Rating(initialRating, onRate) {
  const [rating, setRating] = useState(initialRating || 0);
  const handelRating = (value) => {
    setRating(value);
    if (onRate) onRate(value);
  };
  useEffect(() => {
    if (initialRating) {
      setRating(initialRating);
    }
  }, [initialRating]);
  return (
    <div>
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        return (
          <span
            key={i}
            className={`text-xl sm:text-2xl cursor-pointer transition-colors ${
              starValue <= rating ? "text-yellow-400" : "text-gray-400"
            }`}
            onClick={() => {
              handelRating(starValue);
            }}
          >
            &#9733;
          </span>
        );
      })}
    </div>
  );
}
