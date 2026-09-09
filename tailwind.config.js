/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#e6eaf3",
          100: "#ccd5e6",
          200: "#99abcd",
          300: "#6681b4",
          400: "#33569b",
          500: "#002054", // primary navy (paleta oficial)
          600: "#001a43",
          700: "#001432",
          800: "#000d22",
          900: "#000711",
        },
        accent: {
          teal: "#14e0c4",
          coral: "#ff6b6b",
          amber: "#ffb454",
        },
        surface: {
          light: "#ffffff",
          dark: "#121016",
          cardLight: "#faf6fc",
          cardDark: "#1d1a24",
        },
        navy: "#002054",
        pastel: {
          purple: "#ecc6ff",
          yellow: "#fef1ba",
          green: "#ebfff7",
          blue: "#d9ebff",
        },
      },
      fontFamily: {
        sans: ["RethinkSans_400Regular", "System"],
        semibold: ["RethinkSans_600SemiBold", "System"],
        bold: ["RethinkSans_700Bold", "System"],
        script: ["WindSong_400Regular", "System"],
      },
      borderRadius: {
        card: "20px",
      },
    },
  },
  plugins: [],
};
