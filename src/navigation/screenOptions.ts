import React from "react";
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { Heading } from "@/components/ui/Heading";
import { colors, fonts, sectionColors, type SectionKey } from "@/theme";

// Opciones compartidas por todos los stacks de la app, para que las
// transiciones y los encabezados se sientan del mismo sistema visual: las
// pantallas entran subiendo con fade, y el encabezado usa texto oscuro +
// Protest Strike en mayúsculas, sin sombra ni texto en el botón de volver.
export const defaultScreenOptions: NativeStackNavigationOptions = {
  animation: "fade_from_bottom",
  headerTintColor: colors.ink,
  headerTitleStyle: { fontFamily: fonts.display, color: colors.ink },
  // headerTitleStyle no acepta textTransform: el título se dibuja con Heading
  // para que salga en mayúsculas como pide el manual.
  headerTitle: ({ children }) =>
    React.createElement(Heading, { numberOfLines: 1, style: { fontSize: 20 } }, children),
  headerShadowVisible: false,
  headerBackTitleVisible: false,
};

// Opciones de un stack de sección: fondo (pantallas y encabezado) del color
// pastel de esa sección. Las pantallas no pintan fondo propio para que se vea
// este.
export function sectionScreenOptions(section: SectionKey): NativeStackNavigationOptions {
  const backgroundColor = sectionColors[section];
  return {
    ...defaultScreenOptions,
    headerShown: false,
    headerStyle: { backgroundColor },
    contentStyle: { backgroundColor },
  };
}
