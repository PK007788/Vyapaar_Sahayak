/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "hsl(60 30% 96%)",
        ink: "hsl(160 20% 12%)",
        brand: {
          DEFAULT: "hsl(140 50% 40%)",
          dark: "hsl(140 45% 22%)",
          soft: "hsl(140 45% 92%)",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 12px 30px rgba(15, 23, 42, 0.08)",
        lift: "0 18px 45px rgba(15, 23, 42, 0.14)",
      },
      keyframes: {
        caret: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        }
      },
      animation: {
        caret: "caret 1s step-end infinite",
        floaty: "floaty 4.5s ease-in-out infinite",
        "fade-in": "fadeIn 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
}