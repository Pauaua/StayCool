import { colors, sectionColors } from "./colors";

export { colors, sectionColors };
export type SectionKey = keyof typeof sectionColors;

// Familias tipográficas para los lugares que usan `style` en vez de className.
export const fonts = {
  // Protest Strike: títulos y textos destacados, siempre en mayúsculas.
  display: "ProtestStrike_400Regular",
  regular: "RethinkSans_400Regular",
  semibold: "RethinkSans_600SemiBold",
  bold: "RethinkSans_700Bold",
};
