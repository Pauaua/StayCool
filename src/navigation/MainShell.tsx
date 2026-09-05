import React, { useState } from "react";
import { View } from "react-native";
import { SideRail, RailItem } from "@/navigation/SideRail";
import { HomeNavigator } from "@/navigation/HomeNavigator";
import { BienestarNavigator } from "@/navigation/BienestarNavigator";
import { ImagenNavigator } from "@/navigation/ImagenNavigator";
import { HigieneNavigator } from "@/navigation/HigieneNavigator";
import { PeloNavigator } from "@/navigation/PeloNavigator";
import { SocialNavigator } from "@/navigation/SocialNavigator";
import { GastosNavigator } from "@/navigation/GastosNavigator";
import { GustosNavigator } from "@/navigation/GustosNavigator";
import { NotasNavigator } from "@/navigation/NotasNavigator";

const MODULES: (RailItem & { Component: React.ComponentType })[] = [
  { key: "Home", label: "Inicio", emoji: "🏠", Component: HomeNavigator },
  { key: "Bienestar", label: "Bienestar", emoji: "🧘", Component: BienestarNavigator },
  { key: "Imagen", label: "Imagen", emoji: "👗", Component: ImagenNavigator },
  { key: "Higiene", label: "Higiene", emoji: "🪥", Component: HigieneNavigator },
  { key: "Pelo", label: "Pelo", emoji: "💇", Component: PeloNavigator },
  { key: "Social", label: "Social", emoji: "🎉", Component: SocialNavigator },
  { key: "Gastos", label: "Gastos", emoji: "💸", Component: GastosNavigator },
  { key: "Gustos", label: "Gustos", emoji: "🎧", Component: GustosNavigator },
  { key: "Notas", label: "Notas", emoji: "📝", Component: NotasNavigator },
];

// Reemplaza al bottom tab navigator: un rail lateral fijo con todos los
// módulos (sin necesidad de agruparlos en "Más", porque vertical entran los
// 10 sin apretar) y el contenido del módulo activo a la derecha. Los módulos
// no activos quedan montados con `display: none` en vez de desmontados, así
// no pierden su estado de navegación interno al cambiar de módulo y volver.
export function MainShell() {
  const [activeKey, setActiveKey] = useState("Home");

  return (
    <View className="flex-1 flex-row bg-white dark:bg-surface-dark">
      <SideRail items={MODULES} activeKey={activeKey} onSelect={setActiveKey} />
      <View className="flex-1">
        {MODULES.map(({ key, Component }) => (
          <View key={key} style={{ flex: 1, display: activeKey === key ? "flex" : "none" }}>
            <Component />
          </View>
        ))}
      </View>
    </View>
  );
}
