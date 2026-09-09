import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");
const SPARKLE_COUNT = 16;
const COLORS = ["#ffffff", "#ecc6ff", "#d9ebff", "#ebfff7", "#fef1ba"];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function Sparkle({ index }: { index: number }) {
  const progress = useRef(new Animated.Value(0)).current;
  const left = useRef(randomBetween(0, width - 8)).current;
  const startTop = useRef(randomBetween(0, height * 0.8)).current;
  const size = useRef(randomBetween(3, 7)).current;
  const color = useRef(COLORS[Math.floor(Math.random() * COLORS.length)]).current;

  useEffect(() => {
    function loop() {
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: randomBetween(3500, 6500),
        useNativeDriver: true,
      }).start(() => {
        setTimeout(loop, randomBetween(500, 4000));
      });
    }
    const initialDelay = setTimeout(loop, randomBetween(0, 4000));
    return () => clearTimeout(initialDelay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 40] });
  const opacity = progress.interpolate({
    inputRange: [0, 0.15, 0.85, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <Animated.View
      style={[
        styles.sparkle,
        {
          left,
          top: startTop,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          shadowColor: color,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    />
  );
}

// Capa decorativa de brillitos que aparecen y se desvanecen por toda la
// pantalla. `pointerEvents="none"` para que nunca bloquee toques debajo.
// Se monta una sola vez en App.tsx, por encima de todo el árbol de
// navegación, así se ve en cualquier pantalla de la app.
export function SparkleOverlay() {
  return (
    <Animated.View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: SPARKLE_COUNT }).map((_, i) => (
        <Sparkle key={i} index={i} />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sparkle: {
    position: "absolute",
    shadowOpacity: 0.9,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
});
