import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useProfile } from "@/features/home/hooks/useProfile";
import { useT } from "@/lib/i18n";

interface WelcomeScreenProps {
  onOpenAgenda: () => void;
  onOpenResumen: () => void;
  onOpenPaywall: () => void;
  onOpenConfiguracion: () => void;
}

const WEEKDAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function formatDate(date: Date): string {
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} de ${MONTHS[date.getMonth()]}`;
}

function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function PillButton({
  label,
  onPress,
  filled,
}: {
  label: string;
  onPress: () => void;
  filled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`w-full rounded-full px-6 py-3 items-center justify-center border ${
        filled ? "bg-navy border-navy active:opacity-80" : "bg-white/40 border-navy active:bg-white/60"
      }`}
    >
      <Text className={`font-script ${filled ? "text-white" : "text-navy"}`} style={{ fontSize: 18 }}>
        {label}
      </Text>
    </Pressable>
  );
}

// Pantalla intermedia entre el login y la app: sin rail lateral, solo el
// saludo, la fecha/hora actual y los accesos principales. Vive fuera de
// MainShell a propósito, así no carga los navigators de los módulos hasta
// que el usuario elige "Abrir Agenda".
export function WelcomeScreen({
  onOpenAgenda,
  onOpenResumen,
  onOpenPaywall,
  onOpenConfiguracion,
}: WelcomeScreenProps) {
  const { data: profile } = useProfile();
  const { t, tg } = useT();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  const displayName = profile?.display_name?.trim();

  return (
    <LinearGradient
      colors={["#fef1ba", "#ecc6ff", "#ebfff7", "#d9ebff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <View className="flex-1 items-center px-6 pt-24 pb-10">
        <View className="w-full max-w-sm items-center">
          <Text className="font-script text-navy text-center" style={{ fontSize: 56, lineHeight: 64 }}>
            {displayName ? t("welcome.greetingWithName", { name: displayName }) : tg("welcome.greeting")}
          </Text>
          <Text className="mt-1 text-base text-center text-navy">{t("welcome.subtitle")}</Text>

          <View className="mt-8 items-center">
            <Text className="text-5xl font-bold text-navy">{formatTime(now)}</Text>
            <Text className="mt-1 text-base capitalize text-navy">{formatDate(now)}</Text>
          </View>
        </View>

        <View style={{ flex: 2 }} />

        <View className="mt-8 w-full max-w-sm items-center gap-8">
          <PillButton label={t("welcome.openAgenda")} onPress={onOpenAgenda} />
          <PillButton label={t("welcome.viewResumen")} onPress={onOpenResumen} />
          <PillButton label={t("welcome.goPremium")} onPress={onOpenPaywall} filled />
          <PillButton label={t("welcome.settings")} onPress={onOpenConfiguracion} />
        </View>

        <View style={{ flex: 1 }} />
      </View>
    </LinearGradient>
  );
}
