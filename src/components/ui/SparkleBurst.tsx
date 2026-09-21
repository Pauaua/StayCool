import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Dimensions, Easing, Image, StyleSheet } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SPARKLE_COUNT = 64;
const DURATION = 1100;
// Más colores con contraste (navy y el morado de la marca) para que los
// brillitos se lean bien sobre el degradado pastel; el blanco solo acompaña.
const TINTS = ["#002054", "#b825f2", "#ffffff", "#ecc6ff", "#002054", "#fef1ba", "#b825f2", "#ffffff"];
// Distancia suficiente para que los brillitos más lejanos crucen toda la pantalla.
const MAX_DISTANCE = Math.hypot(SCREEN_WIDTH, SCREEN_HEIGHT);

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

interface SparkleSpec {
  angle: number;
  distance: number;
  size: number;
  spin: number;
  tint: string;
}

interface SparkleBurstProps {
  // Punto de pantalla desde donde explotan los brillitos (donde se tocó).
  x: number;
  y: number;
  onFinish: () => void;
}

// Explosión de brillitos.png que salen desde el punto tocado hacia todos
// lados, girando y desvaneciéndose. `pointerEvents` queda activo a propósito
// para que no se pueda tocar otra cosa mientras dura la transición.
export function SparkleBurst({ x, y, onFinish }: SparkleBurstProps) {
  const progress = useRef(new Animated.Value(0)).current;

  const sparkles = useMemo<SparkleSpec[]>(
    () =>
      Array.from({ length: SPARKLE_COUNT }).map((_, i) => ({
        angle: (i / SPARKLE_COUNT) * Math.PI * 2 + randomBetween(-0.2, 0.2),
        distance: randomBetween(MAX_DISTANCE * 0.12, MAX_DISTANCE * 0.85),
        size: randomBetween(28, 68),
        spin: randomBetween(-1.5, 1.5),
        tint: TINTS[i % TINTS.length],
      })),
    []
  );

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onFinish();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {sparkles.map((s, i) => {
        const translateX = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.cos(s.angle) * s.distance],
        });
        const translateY = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.sin(s.angle) * s.distance],
        });
        const scale = progress.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0.2, 1.35, 1] });
        const opacity = progress.interpolate({ inputRange: [0, 0.08, 0.82, 1], outputRange: [0, 1, 1, 0] });
        const rotate = progress.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", `${s.spin * 360}deg`],
        });

        return (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              left: x - s.size / 2,
              top: y - s.size / 2,
              width: s.size,
              height: s.size,
              opacity,
              transform: [{ translateX }, { translateY }, { scale }, { rotate }],
            }}
          >
            <Image
              source={require("../../../assets/images/brillitos.png")}
              style={{ width: s.size, height: s.size, tintColor: s.tint }}
              resizeMode="contain"
            />
          </Animated.View>
        );
      })}
    </Animated.View>
  );
}
