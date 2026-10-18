import React, { useState } from "react";
import { Alert, Image, ImageSourcePropType, Pressable, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Heading } from "@/components/ui/Heading";
import { BottomIconBar } from "@/components/ui/BottomIconBar";
import { PressableScale } from "@/components/ui/PressableScale";
import { Reveal } from "@/components/ui/Reveal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePremium } from "@/features/premium/hooks/usePremium";
import { useT } from "@/lib/i18n";
import { colors } from "@/theme";

interface Shortcut {
  // Módulo de MainShell que abre, y opcionalmente la pantalla interna.
  module: string;
  route?: string;
  label: string;
  icon: ImageSourcePropType;
}

const CIRCLE_SIZE = 64;

// Menú de accesos directos de la agenda (manual de marca): los módulos en
// círculos blancos con borde, escalonados en filas de 1-2-3-2-1, con el
// personaje grande debajo. Es la única pantalla de MainShell sin rail lateral;
// al elegir un módulo, MainShell vuelve a mostrarlo.
export function AgendaMenuScreen({
  onOpen,
}: {
  onOpen: (module: string, route?: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { isFull } = usePremium();
  const { t, tg } = useT();
  // Tamaño en px del espacio libre bajo el menú: un porcentaje dentro de un
  // contenedor centrado puede colapsar a 0 en Android y ocultar la imagen.
  const [heroSpace, setHeroSpace] = useState({ width: 0, height: 0 });

  const rows: Shortcut[][] = [
    [{ module: "Social", label: "Social", icon: require("../../../../assets/images/eventos sociales.png") }],
    [
      {
        module: "Imagen",
        route: "ImagenHome",
        label: "Imagen",
        icon: require("../../../../assets/images/makeup.png"),
      },
      { module: "Gastos", label: "Gastos", icon: require("../../../../assets/images/dineral.png") },
    ],
    [
      { module: "Bienestar", label: "Bienestar", icon: require("../../../../assets/images/bienestar(_).png") },
      { module: "Gustos", label: "Gustos", icon: require("../../../../assets/images/musica.png") },
      { module: "Higiene", label: "Cuidado Personal", icon: require("../../../../assets/images/higuiene.png") },
    ],
    [
      { module: "Notas", label: "Notas", icon: require("../../../../assets/images/notas.png") },
      {
        module: "Estadisticas",
        label: "Estadísticas",
        icon: isFull
          ? require("../../../../assets/images/estadisticas.png")
          : require("../../../../assets/images/candado.png"),
      },
    ],
    [
      {
        module: "Imagen",
        route: "VestuarioHome",
        label: "Vestuario",
        icon: require("../../../../assets/images/vestidosss.png"),
      },
    ],
  ];

  function handleSignOut() {
    Alert.alert(t("common.confirmSignOutTitle"), tg("common.confirmSignOutMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.signOut"), style: "destructive", onPress: signOut },
    ]);
  }

  return (
    <LinearGradient
      colors={[colors.morado, colors.amarillo, colors.rosado]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <View className="flex-1 px-5" style={{ paddingTop: insets.top + 16 }}>
        <View className="flex-row items-center justify-between">
          <Heading style={{ fontSize: 34, lineHeight: 40 }}>Agenda Cool</Heading>
          <Pressable
            onPress={() => onOpen("Home", "Settings")}
            hitSlop={8}
            accessibilityLabel={t("welcome.settings")}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              borderWidth: 1.5,
              borderColor: colors.ink,
              backgroundColor: colors.white,
            }}
            className="items-center justify-center"
          >
            <Image source={require("../../../../assets/images/tuerca.png")} style={{ width: 34, height: 34 }} />
          </Pressable>
        </View>

        {/* Filas escalonadas: cada una se superpone un poco con la anterior
            para que el menú se lea como una cascada y no como una grilla. */}
        <View className="mt-4 items-center">
          {rows.map((row, i) => (
            <View
              key={i}
              className="flex-row justify-center"
              style={{ gap: 28, marginTop: i === 0 ? 0 : -10 }}
            >
              {row.map((item, j) => (
                <Reveal key={item.label} delay={60 * (i + j)} offset={14}>
                  <PressableScale
                    onPress={() => onOpen(item.module, item.route)}
                    scaleTo={0.9}
                    accessibilityLabel={item.label}
                  >
                    <View
                      style={{
                        width: CIRCLE_SIZE,
                        height: CIRCLE_SIZE,
                        borderRadius: CIRCLE_SIZE / 2,
                        borderWidth: 1.5,
                        borderColor: colors.ink,
                        backgroundColor: colors.white,
                      }}
                      className="items-center justify-center"
                    >
                      <Image source={item.icon} style={{ width: 44, height: 44 }} resizeMode="contain" />
                    </View>
                  </PressableScale>
                </Reveal>
              ))}
            </View>
          ))}
        </View>

        <View
          className="flex-1 items-center justify-center"
          onLayout={(e) => setHeroSpace(e.nativeEvent.layout)}
        >
          <Image
            source={require("../../../../assets/images/ImagenAgenda.png")}
            style={{ width: heroSpace.width, height: Math.min(heroSpace.height, 260) }}
            resizeMode="contain"
          />
        </View>
      </View>

      <BottomIconBar
        items={[
          {
            key: "signOut",
            label: t("common.signOut"),
            icon: require("../../../../assets/images/log out.png"),
            onPress: handleSignOut,
          },
          {
            key: "home",
            label: t("welcome.navHome"),
            icon: require("../../../../assets/images/home.png"),
            onPress: () => onOpen("Home", "HomeDashboard"),
          },
        ]}
      />
    </LinearGradient>
  );
}
