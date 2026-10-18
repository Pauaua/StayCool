import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, View } from "react-native";
import { SideRail, RailItem } from "@/navigation/SideRail";
import { HomeNavigator } from "@/navigation/HomeNavigator";
import { usePremium } from "@/features/premium/hooks/usePremium";
import { useRailVisibility } from "@/navigation/RailVisibilityContext";
import type { HomeStackParamList } from "@/navigation/types";
import { BienestarNavigator } from "@/navigation/BienestarNavigator";
import { ImagenNavigator } from "@/navigation/ImagenNavigator";
import { HigieneNavigator } from "@/navigation/HigieneNavigator";
import { SocialNavigator } from "@/navigation/SocialNavigator";
import { GastosNavigator } from "@/navigation/GastosNavigator";
import { GustosNavigator } from "@/navigation/GustosNavigator";
import { NotasNavigator } from "@/navigation/NotasNavigator";
import { EstadisticasNavigator } from "@/navigation/EstadisticasNavigator";
import { useDivaReminders } from "@/notifications/diva/useDivaReminders";
import { consumePendingModule, onOpenModuleRequest } from "@/notifications/diva/events";
import { sectionColors, type SectionKey } from "@/theme";
import { useT, type TranslationKey } from "@/lib/i18n";
import { AgendaMenuScreen } from "@/features/home/screens/AgendaMenuScreen";
import { navigateInModule } from "@/navigation/moduleNavigation";

// Menú de accesos directos (manual de marca). No es un módulo del rail: se
// abre desde Home y es la única pantalla sin rail lateral.
const AGENDA_KEY = "Agenda";

// Los Component de cada módulo tienen que mantener su identidad entre renders
// (si no, React desmonta el stack y se pierde la navegación interna), por eso
// la etiqueta va como clave y se traduce recién al dibujar el rail.
type ModuleDef = Omit<RailItem, "label"> & { labelKey: TranslationKey; Component: React.ComponentType };

function buildModules(
  initialHomeRoute: keyof HomeStackParamList,
  isFull: boolean,
  onHomeRouteChange: (route: string | undefined) => void
): ModuleDef[] {
  return [
    {
      key: "Home",
      labelKey: "nav.home",
      emoji: "🏠",
      icon: require("../../assets/images/home.png"),
      Component: () => <HomeNavigator initialRouteName={initialHomeRoute} onRouteChange={onHomeRouteChange} />,
    },
    {
      key: "Bienestar",
      labelKey: "bienestar.title",
      emoji: "🧘",
      icon: require("../../assets/images/bienestar(_).png"),
      Component: BienestarNavigator,
    },
    {
      key: "Imagen",
      labelKey: "imagen.title",
      emoji: "👗",
      icon: require("../../assets/images/aufit.png"),
      Component: ImagenNavigator,
    },
    {
      key: "Higiene",
      labelKey: "nav.selfCare",
      emoji: "🪥",
      icon: require("../../assets/images/higuiene.png"),
      Component: HigieneNavigator,
    },
    {
      key: "Social",
      labelKey: "nav.social",
      emoji: "🎉",
      icon: require("../../assets/images/eventos sociales.png"),
      Component: SocialNavigator,
    },
    {
      key: "Gastos",
      labelKey: "gastos.title",
      emoji: "💸",
      icon: require("../../assets/images/dineral.png"),
      Component: GastosNavigator,
    },
    {
      key: "Gustos",
      labelKey: "gustos.title",
      emoji: "🎧",
      icon: require("../../assets/images/musica.png"),
      Component: GustosNavigator,
    },
    {
      key: "Notas",
      labelKey: "notas.title",
      emoji: "📝",
      icon: require("../../assets/images/notas.png"),
      Component: NotasNavigator,
    },
    {
      key: "Estadisticas",
      labelKey: "estadisticas.title",
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
// módulos (sin necesidad de agruparlos en "Más", porque vertical entran
// todos sin apretar) y el contenido del módulo activo a la derecha. Los módulos
// no activos quedan montados con `display: none` en vez de desmontados, así
// no pierden su estado de navegación interno al cambiar de módulo y volver.
export function MainShell({
  initialHomeRoute = "HomeDashboard",
}: {
  initialHomeRoute?: keyof HomeStackParamList;
}) {
  const { isFull } = usePremium();
  const { t } = useT();
  const { hidden: railHidden } = useRailVisibility();
  const [activeKey, setActiveKey] = useState("Home");
  const [initialRoute] = useState(initialHomeRoute);
  // Pantalla actual del stack de Inicio: el panel principal (Hola + semana +
  // recordatorios) se ve sin rail, igual que el menú Agenda.
  const [homeRoute, setHomeRoute] = useState<string | undefined>(initialHomeRoute);
  const modules = useMemo(
    () => buildModules(initialRoute, isFull, setHomeRoute),
    [initialRoute, isFull]
  );
  const showRail =
    !railHidden && activeKey !== AGENDA_KEY && !(activeKey === "Home" && homeRoute === "HomeDashboard");
  // Al cambiar de módulo, el contenido entra con fade + un leve deslizamiento
  // hacia arriba (mismo timing que el resto de las entradas de la app).
  const enter = useRef(new Animated.Value(1)).current;

  useDivaReminders();

  // Abre un módulo (y opcionalmente una pantalla dentro de su stack, ej.
  // Imagen → Vestuario). Los módulos están siempre montados, así que su
  // navigator ya está listo para recibir la ruta.
  function handleOpen(key: string, route?: string) {
    if (route) navigateInModule(key, route);
    handleSelect(key);
  }

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

  // Al tocar una notificación que apunta a un módulo (ej. Recordatorios Diva
  // -> Cuidado Personal), se abre ese módulo. La ref evita re-suscribirse en
  // cada render por el cierre de handleSelect.
  const handleSelectRef = useRef(handleSelect);
  handleSelectRef.current = handleSelect;
  useEffect(() => {
    const open = (key: string) => {
      if (key === AGENDA_KEY || modules.some((m) => m.key === key)) handleSelectRef.current(key);
    };
    const pending = consumePendingModule();
    if (pending) open(pending);
    return onOpenModuleRequest((key) => {
      consumePendingModule();
      open(key);
    });
  }, [modules]);

  return (
    <View
      className="flex-1 flex-row"
      style={{ backgroundColor: sectionColors[activeKey as SectionKey] }}
    >
      {showRail ? (
        <SideRail
          items={modules.map((m) => ({ ...m, label: t(m.labelKey) }))}
          activeKey={activeKey}
          onSelect={handleSelect}
        />
      ) : null}
      <Animated.View
        className="flex-1"
        style={{
          opacity: enter,
          transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
        }}
      >
        {activeKey === AGENDA_KEY ? <AgendaMenuScreen onOpen={handleOpen} /> : null}
        {modules.map(({ key, Component }) => (
          <View key={key} style={{ flex: 1, display: activeKey === key ? "flex" : "none" }}>
            <Component />
          </View>
        ))}
      </Animated.View>
    </View>
  );
}
