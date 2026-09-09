import React from "react";
import { Pressable, Text, View } from "react-native";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
}

// Selector de 1 a 5 estrellas. Si no se pasa onChange, queda solo de lectura
// (para mostrar la puntuación ya guardada de un producto).
export function StarRating({ value, onChange, size = 22 }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <View className="flex-row">
      {stars.map((star) => {
        const filled = star <= value;
        return (
          <Pressable key={star} disabled={!onChange} onPress={() => onChange?.(star)} hitSlop={4}>
            <Text style={{ fontSize: size, opacity: filled ? 1 : 0.3 }}>⭐</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
