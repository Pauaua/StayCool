/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf2ff",
          100: "#f9e0ff",
          200: "#f0b8ff",
          300: "#e485ff",
          400: "#d453ff",
          500: "#b825f2", // primary vibrant purple
          600: "#9518c9",
          700: "#7412a0",
          800: "#560f78",
          900: "#3a0a52",
        },
        accent: {
          teal: "#14e0c4",
          coral: "#ff6b6b",
          amber: "#ffb454",
        },
        surface: {
          light: "#ffffff",
          dark: "#121016",
          cardLight: "#f7f5fb",
          cardDark: "#1d1a24",
        },
      },
      fontFamily: {
        sans: ["Poppins_400Regular", "System"],
        semibold: ["Poppins_600SemiBold", "System"],
        bold: ["Poppins_700Bold", "System"],
      },
      borderRadius: {
        card: "20px",
      },
    },
  },
  plugins: [],
};
