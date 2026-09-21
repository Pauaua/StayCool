import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, Image, StyleSheet } from "react-native";

const COUNT = 7;
const DURATION = 620;
const TINTS = ["#ffffff", "#ecc6ff", "#fef1ba", "#d9ebff", "#ffffff", "#ecc6ff", "#fef1ba"];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

// Mini explosión de brillitos.png desde el centro del contenedor, para
// confirmar una acción (guardar, agregar). Cada vez que `trigger` cambia
// vuelve a dispararse. No captura toques, así que no estorba al botón.
export function TapSparkles({ trigger }: { trigger: number }) {
  const progress = useRef(new Animated.Value(0)).current;

  const specs = useMemo(
    () =>
      Array.from({ length: COUNT }).map((_, i) => ({
        angle: (i / COUNT) * Math.PI * 2 + randomBetween(-0.3, 0.3),
        distance: randomBetween(44, 84),
        size: randomBetween(12, 22),
        tint: TINTS[i % TINTS.length],
      })),
    []
  );

  useEffect(() => {
    if (trigger === 0) return;
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [trigger, progress]);

  const opacity = progress.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 1, 1, 0] });
  const scale = progress.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.3, 1.1, 0.7] });

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity }]}>
      {specs.map((s, i) => {
        const translateX = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.cos(s.angle) * s.distance],
        });
        const translateY = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.sin(s.angle) * s.distance],
        });
        const rotate = progress.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
        return (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              marginLeft: -s.size / 2,
              marginTop: -s.size / 2,
              width: s.size,
              height: s.size,
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
