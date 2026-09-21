import React, { useEffect, useRef, useState } from "react";
import { Alert, GestureResponderEvent, Image, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSparkleTransition } from "@/components/ui/SparkleTransition";
import { PressableScale } from "@/components/ui/PressableScale";
import { Reveal } from "@/components/ui/Reveal";
import { useAutoReactivateAccount, useProfile } from "@/features/home/hooks/useProfile";
import { TrialGiftBox } from "@/features/premium/components/TrialGiftBox";
import { useAuth } from "@/features/auth/hooks/useAuth";
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

// Alto reservado bajo el círculo del regalo para su mensaje ("¡Tienes un regalo!").
const GIFT_LABEL_SPACE = 44;

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
  icon,
  backgroundColor,
  delay,
}: {
  label: string;
  onPress: (e: GestureResponderEvent) => void;
  filled?: boolean;
  icon?: number;
  backgroundColor?: string;
  // Retraso de la entrada en cascada de los botones.
  delay: number;
}) {
  return (
    <Reveal className="w-full" delay={delay} offset={26} style={{ marginTop: 7, marginBottom: 7 }}>
      <PressableScale
        onPress={onPress}
        className={`w-full rounded-full px-6 py-3 flex-row items-center justify-center border ${
          backgroundColor
            ? "active:opacity-80"
            : filled
              ? "bg-navy border-navy active:opacity-80"
              : "bg-white/40 border-navy active:bg-white/60"
        }`}
        style={backgroundColor ? { backgroundColor, borderColor: "#002054" } : undefined}
      >
        {icon ? (
          <Image
            source={icon}
            style={{
              width: 42,
              height: 42,
              marginRight: 8,
              tintColor: filled && !backgroundColor ? "#ffffff" : undefined,
            }}
            resizeMode="contain"
          />
        ) : null}
        <Text
          className={`font-semibold ${backgroundColor ? "text-navy" : filled ? "text-white" : "text-navy"}`}
          style={{ fontSize: 18 }}
        >
          {label}
        </Text>
      </PressableScale>
    </Reveal>
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
  useAutoReactivateAccount();
  const { signOut } = useAuth();
  const { t, tg } = useT();
  const [now, setNow] = useState(() => new Date());
  const sparkle = useSparkleTransition();
  const busy = useRef(false);
  const [giftSpace, setGiftSpace] = useState(300);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  const displayName = profile?.display_name?.trim();

  function handleSignOut() {
    Alert.alert(t("common.confirmSignOutTitle"), tg("common.confirmSignOutMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.signOut"), style: "destructive", onPress: signOut },
    ]);
  }

  // Al tocar un botón: explosión de brillitos desde ese punto y, a los pocos
  // instantes (con los brillitos en pleno vuelo), se ejecuta la acción. Los
  // brillitos viven en una capa global, así siguen volando sobre la pantalla
  // nueva: no hace falta tapar nada con blanco.
  function withBurst(action: () => void) {
    return (e: GestureResponderEvent) => {
      if (busy.current) return;
      busy.current = true;
      sparkle(e.nativeEvent.pageX, e.nativeEvent.pageY);
      setTimeout(() => {
        busy.current = false;
        action();
      }, 350);
    };
  }

  return (
    <LinearGradient
      colors={["#fef1ba", "#ecc6ff", "#ebfff7", "#d9ebff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <View className="flex-1 items-center px-6 pt-16 pb-8">
        <Reveal className="w-full max-w-sm items-center" offset={-18} duration={480}>
          <Text className="font-script text-navy text-center" style={{ fontSize: 56, lineHeight: 64 }}>
            {displayName ? t("welcome.greetingWithName", { name: displayName }) : tg("welcome.greeting")}
          </Text>
          <Text className="mt-1 text-base text-center text-navy">{t("welcome.subtitle")}</Text>

          <View className="mt-8 items-center">
            <Text className="text-5xl font-bold text-navy">{formatTime(now)}</Text>
            <Text className="mt-1 text-base capitalize text-navy">{formatDate(now)}</Text>
          </View>
        </Reveal>

        {/* El regalo ocupa todo el espacio libre entre el reloj y los botones
            y se achica para caber (con su mensaje). zIndex alto: si aun así
            algo se solapara, el regalo queda por encima de los botones. */}
        <View
          style={{ flex: 1, zIndex: 10, elevation: 10 }}
          className="items-center justify-center"
          onLayout={(e) => setGiftSpace(e.nativeEvent.layout.height)}
        >
          <TrialGiftBox size={Math.max(110, Math.min(260, giftSpace - GIFT_LABEL_SPACE))} />
        </View>

        <View className="mt-4 w-full items-center">
          <PillButton
            delay={200}
            label={t("welcome.openAgenda")}
            onPress={withBurst(onOpenAgenda)}
            icon={require("../../../../assets/images/notas2.png")}
          />
          <PillButton
            delay={280}
            label={t("welcome.viewResumen")}
            onPress={withBurst(onOpenResumen)}
            icon={require("../../../../assets/images/estadisticas.png")}
          />
          <PillButton
            delay={360}
            label={t("welcome.goPremium")}
            onPress={withBurst(onOpenPaywall)}
            filled
            icon={require("../../../../assets/images/brillitos.png")}
            backgroundColor="#ecc6ff"
          />
          <PillButton
            delay={440}
            label={t("welcome.settings")}
            onPress={withBurst(onOpenConfiguracion)}
            icon={require("../../../../assets/images/tuerca.png")}
          />
          <PillButton
            delay={520}
            label={t("common.signOut")}
            onPress={withBurst(handleSignOut)}
            icon={require("../../../../assets/images/log out.png")}
          />
        </View>

      </View>

    </LinearGradient>
  );
}
