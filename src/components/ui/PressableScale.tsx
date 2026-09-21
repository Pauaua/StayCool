import React, { useRef } from "react";
import { Animated, Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";

interface PressableScaleProps extends PressableProps {
  // Escala mientras está presionado (0.96 = se "hunde" un 4%).
  scaleTo?: number;
  // El escalado vive en un contenedor externo: los márgenes y el ancho que
  // antes iban en el Pressable van acá, así el layout no cambia.
  wrapperClassName?: string;
  wrapperStyle?: StyleProp<ViewStyle>;
  className?: string;
}

// Pressable con rebote: se hunde al presionar y vuelve con un resorte al
// soltar. Es la microinteracción base de botones, chips y del rail lateral.
export function PressableScale({
  children,
  scaleTo = 0.96,
  wrapperClassName,
  wrapperStyle,
  onPressIn,
  onPressOut,
  ...rest
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;

  function animateTo(value: number) {
    Animated.spring(scale, { toValue: value, friction: 5, tension: 240, useNativeDriver: true }).start();
  }

  return (
    <Animated.View className={wrapperClassName} style={[wrapperStyle, { transform: [{ scale }] }]}>
      <Pressable
        {...rest}
        onPressIn={(e) => {
          animateTo(scaleTo);
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          animateTo(1);
          onPressOut?.(e);
        }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
