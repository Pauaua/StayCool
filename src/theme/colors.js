// Paleta del manual de marca StayCool. Es la única fuente de verdad de
// colores: tailwind.config.js la importa para las clases (bg-morado,
// text-ink...) y el código TS la usa directo donde no hay className
// (LinearGradient, tintColor, headers, ActivityIndicator, calendarios).
// Es .js (no .ts) porque tailwind.config.js corre en Node sin transpilar.

const palette = {
  morado: "#9e97ff",
  rosado: "#e2c7fc",
  amarillo: "#fdffcc",
  cian: "#effef9",
  huesito: "#edebe2",
};

const colors = {
  ...palette,
  // El manual no define un color de texto: todo el texto va oscuro sobre los
  // fondos claros.
  ink: "#121016",
  white: "#ffffff",
  // Fuera del manual, se mantienen por usabilidad / identidad existente.
  danger: "#ff6b6b",
  gold: "#D4AF37",
};

// Fondo de cada sección de la app. Clave = key del módulo en MainShell.
const sectionColors = {
  Home: palette.huesito,
  Bienestar: palette.cian,
  Imagen: palette.rosado,
  Higiene: palette.cian,
  Social: palette.amarillo,
  Gastos: palette.amarillo,
  Gustos: palette.rosado,
  Notas: palette.huesito,
  Estadisticas: palette.rosado,
  // Pantallas fuera de MainShell (auth, bienvenida).
  Auth: palette.rosado,
  Welcome: palette.amarillo,
};

module.exports = { colors, sectionColors };
