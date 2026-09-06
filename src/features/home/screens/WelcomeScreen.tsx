import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { useProfile } from "@/features/home/hooks/useProfile";

interface WelcomeScreenProps {
  onOpenAgenda: () => void;
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

// Pantalla intermedia entre el login y la app: sin rail lateral, solo el
// saludo, la fecha/hora actual y los accesos principales. Vive fuera de
// MainShell a propósito, así no carga los navigators de los módulos hasta
// que el usuario elige "Abrir Agenda".
export function WelcomeScreen({ onOpenAgenda }: WelcomeScreenProps) {
  const { data: profile } = useProfile();
  const [now, setNow] = useState(() => new Date());
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [glow]);

  const displayName = profile?.display_name?.trim();

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-surface-dark px-6">
      <View className="w-full max-w-sm items-center">
        <Text className="text-3xl font-bold text-center text-surface-dark dark:text-white">
          {displayName ? `¡Hola, ${displayName}!` : "¡Bienvenido de nuevo!"}
        </Text>
        <Text className="mt-2 text-base text-center text-slate-500 dark:text-slate-300">
          Qué bueno tenerte de vuelta en Stay Cool.
        </Text>

        <View className="mt-8 items-center">
          <Text className="text-5xl font-bold text-brand-500">{formatTime(now)}</Text>
          <Text className="mt-1 text-base capitalize text-slate-500 dark:text-slate-300">{formatDate(now)}</Text>
        </View>

        <View className="mt-12 w-full gap-3">
          <Pressable
            onPress={onOpenAgenda}
            className="rounded-card px-5 py-3.5 items-center justify-center bg-brand-500 active:bg-brand-600"
          >
            <Text className="font-semibold text-base text-white">Abrir Agenda</Text>
          </Pressable>

          <Pressable className="rounded-card px-5 py-3.5 items-center justify-center bg-transparent border border-brand-500">
            <Text className="font-semibold text-base text-brand-500">Abrir Resumen</Text>
          </Pressable>

          <Animated.View
            style={{
              shadowColor: "#f2c744",
              shadowOpacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.85] }),
              shadowRadius: glow.interpolate({ inputRange: [0, 1], outputRange: [4, 14] }),
              shadowOffset: { width: 0, height: 0 },
              elevation: 6,
            }}
          >
            <Pressable className="rounded-card px-5 py-3.5 items-center justify-center bg-amber-400 active:bg-amber-500">
              <Text className="font-semibold text-base text-surface-dark">✨ Hazte Premium</Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}
