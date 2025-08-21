import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx,js,jsx}", "./components/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 500: "#6366f1" }, // indigo
        accent: { 500: "#a855f7" } // violet
      },
      borderRadius: { "2xl": "1rem" }
    },
  },
  plugins: [],
};
export default config;
