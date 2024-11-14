/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        dotMove1: "dotMove 1.2s linear infinite",
        dotMove2: "dotMove 1.2s linear infinite 0.4s",
        dotMove3: "dotMove 1.2s linear infinite 0.8s",
        pulse: "pulse 2s ease-in-out infinite",
        fade: "fadeInOut 3s ease-in-out infinite",
      },
      keyframes: {
        // Dot move animation
        dotMove: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.5)" },
          "100%": { transform: "scale(1)" },
        },
        // Fade effect for sub-text
        fadeInOut: {
          "0%": { opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
