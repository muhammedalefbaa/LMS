// tailwind.config.js
/**@type {import('tailwindcss').Config}*/

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontSize: {
        "course-detail-heading-small": ["26px", "36px"],
        "course-detail-heading-larg": ["36px", "44px"],
        "course-heading-small": ["28px", "34px"],
        "course-heading-larg": ["48px", "56px"],
        defult: ["16px", "20px"],
      },
    },
  },
  plugins: [],
};
