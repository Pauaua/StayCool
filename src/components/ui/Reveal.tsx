import React, { useEffect, useRef } from "react";
import { Animated, Easing, ViewProps } from "react-native";

interface RevealProps extends ViewProps {
  className?: string;
  // Retraso antes de arrancar: escalonar varios Reveal seguidos da el efecto
  // de "cascada" (ej. 0, 80, 160 ms).
  delay?: number;
  // Cuántos px se desplaza al entrar (positivo = sube desde abajo, negativo =
  // baja desde arriba).
  offset?: number;
  duration?: number;
  animated?: boolean;
}

// Entrada suave (fade + desplazamiento) al montarse. Es la base de la
// "cascada" de tarjetas y botones de toda la app: mismo timing y curva en
// todos lados para que el movimiento se sienta de un mismo sistema.
export function Reveal({
  children,
  className,
  style,
  delay = 0,
  offset = 14,
  duration = 340,
  animated = true,
  ...rest
}: RevealProps) {
  const progress = useRef(new Animated.Value(animated ? 0 : 1)).current;

  useEffect(() => {
    if (!animated) return;
    Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [offset, 0] });

  return (
    <Animated.View
      className={className}
      style={[style, { opacity: progress, transform: [{ translateY }] }]}
      {...rest}
    >
      {children}
    </Animated.View>
  );
}
