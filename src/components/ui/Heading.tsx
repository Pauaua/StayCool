import React from "react";
import { Text, TextProps } from "react-native";

interface HeadingProps extends TextProps {
  className?: string;
}

// Títulos y textos destacados del manual de marca: Protest Strike, siempre en
// mayúsculas. El uppercase va acá y no en los textos, así las traducciones
// quedan escritas normal.
export function Heading({ className = "", style, ...rest }: HeadingProps) {
  return (
    <Text
      className={`font-display text-ink ${className}`}
      style={[{ textTransform: "uppercase" }, style]}
      {...rest}
    />
  );
}
