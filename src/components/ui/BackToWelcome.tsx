import React from "react";
import { Pressable, Text } from "react-native";
import { useGoToWelcome } from "@/navigation/WelcomeNavigationContext";
import { useT } from "@/lib/i18n";

// Link "‹ Panel inicial" que va arriba de la pantalla principal de cada
// módulo de la agenda (mismo estilo que el del Home), para volver al panel
// inicial (Abrir Agenda / Ver Resumen / Hazte Diva) desde cualquier módulo.
export function BackToWelcome() {
  const goToWelcome = useGoToWelcome();
  const { t } = useT();
  return (
    <Pressable onPress={goToWelcome} className="flex-row items-center mb-2 self-start" hitSlop={8}>
      <Text className="text-xl text-brand-500">‹</Text>
      <Text className="text-sm text-brand-500 ml-1">{t("home.back")}</Text>
    </Pressable>
  );
}
