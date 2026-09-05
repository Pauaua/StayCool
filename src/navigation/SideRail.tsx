import React, { useRef, useState } from "react";
import { Animated, Pressable, ScrollView, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface RailItem {
  key: string;
  label: string;
  emoji: string;
}

const COLLAPSED_WIDTH = 64;
const EXPANDED_WIDTH = 212;

// Rail lateral fijo con todos los módulos. En mobile no existe "hover", así
// que en vez de expandirse al pasar el mouse, se expande/colapsa con un tap
// en el botón de arriba y queda así hasta que el usuario lo vuelva a tocar.
export function SideRail({
  items,
  activeKey,
  onSelect,
}: {
  items: RailItem[];
  activeKey: string;
  onSelect: (key: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(false);
  const widthAnim = useRef(new Animated.Value(COLLAPSED_WIDTH)).current;

  function toggle() {
    const next = !expanded;
    setExpanded(next);
    Animated.timing(widthAnim, {
      toValue: next ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }

  return (
    <Animated.View
      style={{
        width: widthAnim,
        paddingTop: insets.top + 8,
        paddingBottom: insets.bottom + 8,
      }}
      className="bg-surface-dark border-r border-white/10"
    >
      <Pressable onPress={toggle} className="items-center py-2 mb-3" hitSlop={8}>
        <Text className="text-white text-lg">{expanded ? "◀" : "☰"}</Text>
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false}>
        {items.map((item) => {
          const active = item.key === activeKey;
          return (
            <Pressable
              key={item.key}
              onPress={() => onSelect(item.key)}
              className={`flex-row items-center px-4 py-3 mx-2 mb-1 rounded-card ${
                active ? "bg-brand-500" : ""
              }`}
            >
              <Text className="text-xl">{item.emoji}</Text>
              {expanded ? (
                <Text
                  numberOfLines={1}
                  className={`ml-3 font-semibold ${active ? "text-white" : "text-gray-300"}`}
                >
                  {item.label}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}
