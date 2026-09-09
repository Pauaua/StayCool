import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import type { ViewProps } from "react-native";

// Fondo degradado pastel (amarillo → morado → verde → celeste) compartido
// por las pantallas que siguen la estética de referencia (auth, bienvenida).
export function GradientBackground({ children, className = "", ...rest }: ViewProps & { className?: string }) {
  return (
    <LinearGradient
      colors={["#fef1ba", "#ecc6ff", "#ebfff7", "#d9ebff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className={`flex-1 ${className}`}
      {...rest}
    >
      {children}
    </LinearGradient>
  );
}
