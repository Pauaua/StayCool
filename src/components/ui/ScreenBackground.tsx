import React from "react";
import { View, type ViewProps } from "react-native";
import { colors } from "@/theme";

// Fondo de color sólido del manual de marca, para las pantallas que viven
// fuera de MainShell (auth, bienvenida). Dentro de la agenda el fondo lo pone
// cada navigator según su sección (sectionScreenOptions).
export function ScreenBackground({
  children,
  color = colors.huesito,
  className = "",
  style,
  ...rest
}: ViewProps & { className?: string; color?: string }) {
  return (
    <View className={`flex-1 ${className}`} style={[{ backgroundColor: color }, style]} {...rest}>
      {children}
    </View>
  );
}
