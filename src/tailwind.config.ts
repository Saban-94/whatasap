import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sabanGold: "#C9A227", // הזהב המקצועי של ח. סבן
        sabanBlack: "#0A0A0A",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      // הגדרות מיוחדות לטקסט של ג'ימיני (prose)
      typography: {
        DEFAULT: {
          css: {
            color: '#fff',
            strong: { color: '#C9A227' }, // הדגשות יהיו בזהב
            h1: { color: '#C9A227' },
            h2: { color: '#C9A227' },
            h3: { color: '#C9A227' },
            li: { markerColor: '#C9A227' }, // בולטים בזהב
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"), // הפלאגין שמאפשר את ה-Class "prose"
  ],
};
export default config;
