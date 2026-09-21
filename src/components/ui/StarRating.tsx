import React, { useEffect, useRef } from "react";
import { Animated, Pressable, View } from "react-native";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
}

function Star({ filled, size }: { filled: boolean; size: number }) {
  const pop = useRef(new Animated.Value(1)).current;
  const firstRender = useRef(true);

  // Cuando una estrella pasa a estar llena, salta y se asienta; en cascada
  // por el retraso natural de cada una al re-renderizar.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (!filled) return;
    Animated.sequence([
      Animated.spring(pop, { toValue: 1.4, friction: 4, tension: 320, useNativeDriver: true }),
      Animated.spring(pop, { toValue: 1, friction: 5, tension: 200, useNativeDriver: true }),
    ]).start();
  }, [filled, pop]);

  return (
    <Animated.Text style={{ fontSize: size, opacity: filled ? 1 : 0.3, transform: [{ scale: pop }] }}>
      ⭐
    </Animated.Text>
  );
}

// Selector de 1 a 5 estrellas. Si no se pasa onChange, queda solo de lectura
// (para mostrar la puntuación ya guardada de un producto).
export function StarRating({ value, onChange, size = 22 }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <View className="flex-row">
      {stars.map((star) => (
        <Pressable key={star} disabled={!onChange} onPress={() => onChange?.(star)} hitSlop={4}>
          <Star filled={star <= value} size={size} />
        </Pressable>
      ))}
    </View>
  );
}
