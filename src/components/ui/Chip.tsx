import React, { useEffect, useRef } from "react";
import { Animated, Text } from "react-native";
import { PressableScale } from "@/components/ui/PressableScale";

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: string;
}

export function Chip({ label, selected, onPress, icon }: ChipProps) {
  // Al quedar seleccionado, el chip "pega un saltito" y se asienta.
  const pop = useRef(new Animated.Value(1)).current;
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (!selected) return;
    Animated.sequence([
      Animated.spring(pop, { toValue: 1.14, friction: 4, tension: 300, useNativeDriver: true }),
      Animated.spring(pop, { toValue: 1, friction: 5, tension: 200, useNativeDriver: true }),
    ]).start();
  }, [selected, pop]);

  return (
    <PressableScale wrapperClassName="mr-2 mb-2" onPress={onPress} scaleTo={0.93}>
      <Animated.View
        className={`px-4 py-2 rounded-full border ${
          selected
            ? "bg-brand-500 border-brand-500"
            : "bg-transparent border-gray-300 dark:border-gray-600"
        }`}
        style={{ transform: [{ scale: pop }] }}
      >
        <Text className={selected ? "text-white font-semibold" : "text-surface-dark dark:text-white"}>
          {icon ? `${icon} ` : ""}
          {label}
        </Text>
      </Animated.View>
    </PressableScale>
  );
}
