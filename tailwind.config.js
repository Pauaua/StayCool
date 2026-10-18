const { colors } = require("./src/theme/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Paleta del manual de marca (src/theme/colors.js).
        morado: colors.morado,
        rosado: colors.rosado,
        amarillo: colors.amarillo,
        cian: colors.cian,
        huesito: colors.huesito,
        ink: colors.ink,
        danger: colors.danger,
        accent: {
          // coral = rojo de error (danger); amber y teal se mantienen hasta
          // decidir su reemplazo.
          teal: "#14e0c4",
          coral: colors.danger,
          amber: "#ffb454",
        },
        surface: {
          light: "#ffffff",
          dark: colors.ink,
          cardLight: "#ffffff",
          cardDark: "#1d1a24",
        },
      },
      fontFamily: {
        sans: ["RethinkSans_400Regular", "System"],
        semibold: ["RethinkSans_600SemiBold", "System"],
        bold: ["RethinkSans_700Bold", "System"],
        display: ["ProtestStrike_400Regular", "System"],
      },
      borderRadius: {
        card: "24px",
      },
    },
  },
  plugins: [],
};
