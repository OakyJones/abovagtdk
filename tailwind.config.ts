import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: "#1B7A6E",
          50: "#E6F5F3",
          100: "#C0E8E3",
          600: "#1B7A6E",
          700: "#155F56",
        },
      },
    },
  },
  plugins: [],
};

export default config;
