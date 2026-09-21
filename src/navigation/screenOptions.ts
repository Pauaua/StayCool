import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";

// Opciones compartidas por todos los stacks de la app, para que las
// transiciones y los encabezados se sientan del mismo sistema visual: las
// pantallas entran subiendo con fade, y el encabezado usa navy + Rethink Sans
// semibold, sin sombra ni texto en el botón de volver.
export const defaultScreenOptions: NativeStackNavigationOptions = {
  animation: "fade_from_bottom",
  headerTintColor: "#002054",
  headerTitleStyle: { fontFamily: "RethinkSans_600SemiBold", color: "#002054" },
  headerShadowVisible: false,
  headerBackTitleVisible: false,
};
