import React, { useRef, useState } from "react";
import { Alert, Animated, Image, ImageSourcePropType, Pressable, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useT } from "@/lib/i18n";

export interface RailItem {
  key: string;
  label: string;
  emoji: string;
  // Ilustración de línea del módulo (assets/images) — si está presente,
  // reemplaza al emoji dentro del círculo.
  icon?: ImageSourcePropType;
}

const COLLAPSED_WIDTH = 64;
const EXPANDED_WIDTH = 212;
const ICON_SIZE = 42;

// Rail lateral fijo con todos los módulos. En mobile no existe "hover", así
// que en vez de expandirse al pasar el mouse, se expande/colapsa con un tap
// en el botón de arriba y queda así hasta que el usuario lo vuelva a tocar.
// El fondo degradado pastel + íconos circulares siguen la estética de
// referencia (assets/estilo/modelo.jpeg).
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
  const { signOut } = useAuth();
  const { t, tg } = useT();
  const [expanded, setExpanded] = useState(false);
  const widthAnim = useRef(new Animated.Value(COLLAPSED_WIDTH)).current;

  function handleSignOut() {
    Alert.alert(t("common.confirmSignOutTitle"), tg("common.confirmSignOutMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.signOut"), style: "destructive", onPress: signOut },
    ]);
  }

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
    <Animated.View style={{ width: widthAnim }}>
      <LinearGradient
        colors={["#fef1ba", "#ecc6ff", "#ebfff7", "#d9ebff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          flex: 1,
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 8,
        }}
      >
        <Pressable onPress={toggle} className="items-center py-2 mb-3" hitSlop={8}>
          <Text className="text-navy text-lg">{expanded ? "◀" : "☰"}</Text>
        </Pressable>

        <ScrollView showsVerticalScrollIndicator={false}>
          {items.map((item) => {
            const active = item.key === activeKey;
            return (
              <Pressable
                key={item.key}
                onPress={() => onSelect(item.key)}
                className="flex-row items-center px-2.5 py-1.5 mx-2 mb-2"
              >
                <View
                  style={{
                    width: ICON_SIZE,
                    height: ICON_SIZE,
                    borderRadius: ICON_SIZE / 2,
                  }}
                  className={`items-center justify-center border ${
                    active ? "bg-navy border-navy" : "bg-white/70 border-white"
                  }`}
                >
                  {item.icon ? (
                    <Image source={item.icon} style={{ width: 34, height: 34 }} resizeMode="contain" />
                  ) : (
                    <Text className="text-xl">{item.emoji}</Text>
                  )}
                </View>
                {expanded ? (
                  <Text
                    numberOfLines={1}
                    className={`ml-3 font-semibold ${active ? "text-navy" : "text-navy/70"}`}
                  >
                    {item.label}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable
          onPress={handleSignOut}
          className="flex-row items-center px-2.5 py-1.5 mx-2 mt-2"
        >
          <View
            style={{ width: ICON_SIZE, height: ICON_SIZE, borderRadius: ICON_SIZE / 2 }}
            className="items-center justify-center border bg-white/70 border-white"
          >
            <Image
              source={require("../../assets/images/log out.png")}
              style={{ width: 34, height: 34 }}
              resizeMode="contain"
            />
          </View>
          {expanded ? (
            <Text numberOfLines={1} className="ml-3 font-semibold text-navy/70">
              {t("common.signOut")}
            </Text>
          ) : null}
        </Pressable>
      </LinearGradient>
    </Animated.View>
  );
}
