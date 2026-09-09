import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");
const CIRCLE_COUNT = 14;
// Paleta por defecto: predomina el moradito, mezclado con el resto de los
// colores de la app.
const DEFAULT_COLORS = ["#ecc6ff", "#ecc6ff", "#ecc6ff", "#d9ebff", "#fef1ba", "#ebfff7"];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function Circle({ index, colors }: { index: number; colors: string[] }) {
  const progress = useRef(new Animated.Value(0)).current;
  const left = useRef(randomBetween(0, width - 20)).current;
  const size = useRef(randomBetween(6, 14)).current;
  const color = useRef(colors[index % colors.length]).current;
  const duration = useRef(randomBetween(6000, 11000)).current;

  useEffect(() => {
    function loop() {
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start(() => loop());
    }
    const initialDelay = setTimeout(loop, randomBetween(0, duration));
    return () => clearTimeout(initialDelay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [-20, height + 20] });
  const opacity = progress.interpolate({
    inputRange: [0, 0.08, 0.85, 1],
    outputRange: [0, 0.8, 0.8, 0],
  });

  return (
    <Animated.View
      style={[
        styles.circle,
        {
          left,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    />
  );
}

// Lluvia de circulitos de colores cayendo de arriba hacia abajo, para
// pantallas premium (Mi Resumen, StayCoolPlus). `pointerEvents="none"` para
// que nunca bloquee toques a los botones de abajo. `colors` define la
// paleta y qué tono predomina (repetilo más veces en el array).
export function FallingCircles({ colors = DEFAULT_COLORS }: { colors?: string[] }) {
  return (
    <Animated.View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: CIRCLE_COUNT }).map((_, i) => (
        <Circle key={i} index={i} colors={colors} />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  circle: {
    position: "absolute",
  },
});
