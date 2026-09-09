import React from "react";
import { Text, View } from "react-native";

interface IllustrationPlaceholderProps {
  emoji: string;
  height?: number;
}

// Espacio reservado para una ilustración de línea (estilo de la referencia
// de diseño) hasta que se sume el asset definitivo — mientras tanto muestra
// el emoji representativo de la sección.
export function IllustrationPlaceholder({ emoji, height = 140 }: IllustrationPlaceholderProps) {
  return (
    <View
      style={{ height }}
      className="w-full items-center justify-center rounded-card border border-dashed border-brand-300 bg-white/40 dark:bg-white/5 mb-4"
    >
      <Text style={{ fontSize: 48 }}>{emoji}</Text>
    </View>
  );
}
