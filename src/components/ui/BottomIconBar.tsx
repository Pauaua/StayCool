import React from "react";
import { GestureResponderEvent, Image, ImageSourcePropType, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PressableScale } from "@/components/ui/PressableScale";
import { colors } from "@/theme";

export interface BottomIconBarItem {
  key: string;
  label: string;
  icon: ImageSourcePropType;
  onPress?: (e: GestureResponderEvent) => void;
  // Marca la pantalla en la que ya se está (círculo relleno morado).
  active?: boolean;
  // El ícono ocupa todo el círculo (ej. el corazón del logo, que es una
  // ilustración cuadrada con fondo propio).
  fill?: boolean;
}

const CIRCLE_SIZE = 56;

// Navegación inferior del manual de marca: íconos dentro de círculos con
// borde, con su etiqueta debajo.
export function BottomIconBar({ items }: { items: BottomIconBarItem[] }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="w-full flex-row justify-around items-start pt-3"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      {items.map((item) => (
        <PressableScale
          key={item.key}
          onPress={item.onPress}
          disabled={!item.onPress}
          scaleTo={0.92}
          className="items-center"
        >
          <View
            style={{
              width: CIRCLE_SIZE,
              height: CIRCLE_SIZE,
              borderRadius: CIRCLE_SIZE / 2,
              borderWidth: 1.5,
              borderColor: colors.ink,
              backgroundColor: item.active ? colors.morado : colors.white,
              overflow: "hidden",
              // Activo + ícono a todo el círculo: el resaltado va en el borde.
              ...(item.active && item.fill ? { borderWidth: 3, borderColor: colors.morado } : null),
            }}
            className="items-center justify-center"
          >
            {item.fill ? (
              <Image
                source={item.icon}
                style={{ width: CIRCLE_SIZE - 3, height: CIRCLE_SIZE - 3, borderRadius: (CIRCLE_SIZE - 3) / 2 }}
                resizeMode="cover"
              />
            ) : (
              <Image source={item.icon} style={{ width: 38, height: 38 }} resizeMode="contain" />
            )}
          </View>
          <Text className="mt-1 text-xs font-semibold text-ink">{item.label}</Text>
        </PressableScale>
      ))}
    </View>
  );
}
