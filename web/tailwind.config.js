/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fef2f2",
          100: "#fde3e3",
          200: "#fbcdcd",
          300: "#f7baba",
          400: "#f09a9a",
          500: "#e86868",
          600: "#d54040",
          700: "#b83232",
          800: "#982828",
          900: "#802323",
        },
      },
    },
  },
  plugins: [],
};
