/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        cancomRed: '#CC0000', // Custom red color inspired by otp.cancom.de
      },
    },
  },
  plugins: [],
};