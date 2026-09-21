import React, { useEffect, useRef } from "react";
import { Animated, Easing, ViewProps } from "react-native";

// Flotación suave y continua (sube y baja unos px). Para ilustraciones
// protagonistas, que se sientan "vivas" sin distraer.
export function Floating({
  children,
  amplitude = 8,
  duration = 2600,
  style,
  ...rest
}: ViewProps & { amplitude?: number; duration?: number }) {
  const wave = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(wave, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(wave, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [wave, duration]);

  const translateY = wave.interpolate({ inputRange: [0, 1], outputRange: [amplitude, -amplitude] });

  return (
    <Animated.View style={[style, { transform: [{ translateY }] }]} {...rest}>
      {children}
    </Animated.View>
  );
}
