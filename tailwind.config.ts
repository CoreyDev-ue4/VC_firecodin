import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        fire: {
          50: "#fff4f1",
          100: "#ffe6de",
          200: "#ffc8b8",
          300: "#ffa185",
          400: "#ff744d",
          500: "#ff4b1f",
          600: "#ed3313",
          700: "#c22512",
          800: "#9a1f15",
          900: "#7c1b15"
        }
      }
    }
  },
  plugins: []
};

export default config;
