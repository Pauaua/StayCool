import React, { useMemo, useRef, useState } from "react";
import { Animated, Easing, View } from "react-native";
import { SideRail, RailItem } from "@/navigation/SideRail";
import { HomeNavigator } from "@/navigation/HomeNavigator";
import { usePremium } from "@/features/premium/hooks/usePremium";
import { useRailVisibility } from "@/navigation/RailVisibilityContext";
import type { HomeStackParamList } from "@/navigation/types";
import { BienestarNavigator } from "@/navigation/BienestarNavigator";
import { ImagenNavigator } from "@/navigation/ImagenNavigator";
import { HigieneNavigator } from "@/navigation/HigieneNavigator";
import { PeloNavigator } from "@/navigation/PeloNavigator";
import { SocialNavigator } from "@/navigation/SocialNavigator";
import { GastosNavigator } from "@/navigation/GastosNavigator";
import { GustosNavigator } from "@/navigation/GustosNavigator";
import { NotasNavigator } from "@/navigation/NotasNavigator";
import { EstadisticasNavigator } from "@/navigation/EstadisticasNavigator";

function buildModules(
  initialHomeRoute: keyof HomeStackParamList,
  isFull: boolean
): (RailItem & { Component: React.ComponentType })[] {
  return [
    {
      key: "Home",
      label: "Inicio",
      emoji: "🏠",
      icon: require("../../assets/images/home.png"),
      Component: () => <HomeNavigator initialRouteName={initialHomeRoute} />,
    },
    {
      key: "Bienestar",
      label: "Bienestar",
      emoji: "🧘",
      icon: require("../../assets/images/bienestar(_).png"),
      Component: BienestarNavigator,
    },
    {
      key: "Imagen",
      label: "Imagen",
      emoji: "👗",
      icon: require("../../assets/images/aufit.png"),
      Component: ImagenNavigator,
    },
    {
      key: "Higiene",
      label: "Cuidado Personal",
      emoji: "🪥",
      icon: require("../../assets/images/higuiene.png"),
      Component: HigieneNavigator,
    },
    {
      key: "Pelo",
      label: "Pelo",
      emoji: "💇",
      icon: require("../../assets/images/pelito.png"),
      Component: PeloNavigator,
    },
    {
      key: "Social",
      label: "Social",
      emoji: "🎉",
      icon: require("../../assets/images/eventos sociales.png"),
      Component: SocialNavigator,
    },
    {
      key: "Gastos",
      label: "Gastos",
      emoji: "💸",
      icon: require("../../assets/images/dineral.png"),
      Component: GastosNavigator,
    },
    {
      key: "Gustos",
      label: "Gustos",
      emoji: "🎧",
      icon: require("../../assets/images/musica.png"),
      Component: GustosNavigator,
    },
    {
      key: "Notas",
      label: "Notas",
      emoji: "📝",
      icon: require("../../assets/images/notas.png"),
      Component: NotasNavigator,
    },
    {
      key: "Estadisticas",
      label: "Estadísticas",
      emoji: isFull ? "📊" : "🔒",
      icon: isFull
        ? require("../../assets/images/estadisticas.png")
        : require("../../assets/images/candado.png"),
      premium: isFull,
      Component: EstadisticasNavigator,
    },
  ];
}

// Reemplaza al bottom tab navigator: un rail lateral fijo con todos los
// módulos (sin necesidad de agruparlos en "Más", porque vertical entran los
// 10 sin apretar) y el contenido del módulo activo a la derecha. Los módulos
// no activos quedan montados con `display: none` en vez de desmontados, así
// no pierden su estado de navegación interno al cambiar de módulo y volver.
export function MainShell({
  initialHomeRoute = "HomeDashboard",
}: {
  initialHomeRoute?: keyof HomeStackParamList;
}) {
  const { isFull } = usePremium();
  const { hidden: railHidden } = useRailVisibility();
  const [activeKey, setActiveKey] = useState("Home");
  const [initialRoute] = useState(initialHomeRoute);
  const modules = useMemo(() => buildModules(initialRoute, isFull), [initialRoute, isFull]);
  // Al cambiar de módulo, el contenido entra con fade + un leve deslizamiento
  // hacia arriba (mismo timing que el resto de las entradas de la app).
  const enter = useRef(new Animated.Value(1)).current;

  function handleSelect(key: string) {
    if (key === activeKey) return;
    setActiveKey(key);
    enter.setValue(0);
    Animated.timing(enter, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }

  return (
    <View className="flex-1 flex-row bg-white dark:bg-surface-dark">
      {railHidden ? null : <SideRail items={modules} activeKey={activeKey} onSelect={handleSelect} />}
      <Animated.View
        className="flex-1"
        style={{
          opacity: enter,
          transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
        }}
      >
        {modules.map(({ key, Component }) => (
          <View key={key} style={{ flex: 1, display: activeKey === key ? "flex" : "none" }}>
            <Component />
          </View>
        ))}
      </Animated.View>
    </View>
  );
}
