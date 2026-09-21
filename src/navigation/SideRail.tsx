import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PressableScale } from "@/components/ui/PressableScale";
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
  // Marca el ícono con un borde dorado sutil (funcionalidad premium activa).
  premium?: boolean;
}

const COLLAPSED_WIDTH = 64;
const EXPANDED_WIDTH = 212;
const ICON_SIZE = 42;

// Ícono circular de un módulo. Al quedar activo "salta" y aparece un brillito
// titilando en su esquina, para que se note claramente dónde estás.
function RailIcon({ item, active }: { item: RailItem; active: boolean }) {
  const pop = useRef(new Animated.Value(1)).current;
  const twinkle = useRef(new Animated.Value(0)).current;
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
    } else if (active) {
      Animated.sequence([
        Animated.spring(pop, { toValue: 1.18, friction: 4, tension: 300, useNativeDriver: true }),
        Animated.spring(pop, { toValue: 1, friction: 5, tension: 200, useNativeDriver: true }),
      ]).start();
    }

    if (!active) {
      twinkle.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkle, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(twinkle, { toValue: 0.2, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [active, pop, twinkle]);

  const badgeScale = twinkle.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.15] });
  const badgeRotate = twinkle.interpolate({ inputRange: [0, 1], outputRange: ["-20deg", "20deg"] });

  return (
    <Animated.View style={{ transform: [{ scale: pop }] }}>
      <View
        style={{
          width: ICON_SIZE,
          height: ICON_SIZE,
          borderRadius: ICON_SIZE / 2,
          ...(item.premium ? { borderWidth: 2, borderColor: "#D4AF37" } : { borderWidth: 1 }),
        }}
        className={`items-center justify-center ${
          item.premium
            ? active
              ? "bg-pastel-purple"
              : "bg-white/70"
            : active
            ? "bg-pastel-purple border-pastel-purple"
            : "bg-white/70 border-white"
        }`}
      >
        {item.icon ? (
          <Image source={item.icon} style={{ width: 34, height: 34 }} resizeMode="contain" />
        ) : (
          <Text className="text-xl">{item.emoji}</Text>
        )}
      </View>
      {active ? (
        <Animated.Image
          source={require("../../assets/images/brillitos.png")}
          style={{
            position: "absolute",
            top: -5,
            right: -5,
            width: 16,
            height: 16,
            tintColor: "#002054",
            opacity: twinkle,
            transform: [{ scale: badgeScale }, { rotate: badgeRotate }],
          }}
          resizeMode="contain"
        />
      ) : null}
    </Animated.View>
  );
}

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
        <View className="items-center mb-2">
          <Image
            source={require("../../assets/images/Logo.jpg")}
            style={{ width: expanded ? 56 : 36, height: expanded ? 56 : 36 }}
            resizeMode="contain"
          />
        </View>

        <Pressable onPress={toggle} className="items-center py-2 mb-3" hitSlop={8}>
          <Text className="text-navy text-lg">{expanded ? "◀" : "☰"}</Text>
        </Pressable>

        <ScrollView showsVerticalScrollIndicator={false}>
          {items.map((item) => {
            const active = item.key === activeKey;
            return (
              <PressableScale
                key={item.key}
                wrapperClassName="mx-2 mb-1"
                onPress={() => onSelect(item.key)}
                scaleTo={0.92}
                className="flex-row items-center px-2.5 py-1"
              >
                <RailIcon item={item} active={active} />
                {expanded ? (
                  <Text
                    numberOfLines={1}
                    className={`ml-3 font-semibold ${active ? "text-navy" : "text-navy/70"}`}
                  >
                    {item.label}
                  </Text>
                ) : null}
              </PressableScale>
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
