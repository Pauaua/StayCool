import React, { useEffect, useRef, useState } from "react";
import { Alert, GestureResponderEvent, Image, Text, View, useWindowDimensions } from "react-native";
import { useSparkleTransition } from "@/components/ui/SparkleTransition";
import { Button } from "@/components/ui/Button";
import { BottomIconBar } from "@/components/ui/BottomIconBar";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { sectionColors } from "@/theme";
import { Reveal } from "@/components/ui/Reveal";
import { useAutoReactivateAccount, useProfile } from "@/features/home/hooks/useProfile";
import { TrialGiftBox } from "@/features/premium/components/TrialGiftBox";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useT, type Language } from "@/lib/i18n";
import { Heading } from "@/components/ui/Heading";

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

const WEEKDAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatDate(date: Date, lang: Language): string {
  if (lang === "en") {
    return `${WEEKDAYS_EN[date.getDay()]}, ${MONTHS_EN[date.getMonth()]} ${date.getDate()}`;
  }
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
export function WelcomeScreen({
  onOpenAgenda,
  onOpenResumen,
  onOpenPaywall,
  onOpenConfiguracion,
}: WelcomeScreenProps) {
  const { data: profile } = useProfile();
  useAutoReactivateAccount();
  const { signOut } = useAuth();
  const { t, tg, lang } = useT();
  const [now, setNow] = useState(() => new Date());
  const sparkle = useSparkleTransition();
  const busy = useRef(false);
  const [giftSpace, setGiftSpace] = useState(300);
  const { width } = useWindowDimensions();

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  const displayName = profile?.display_name?.trim();
  // Mientras se ve el regalo (sin reclamar, o recién abierto), el personaje
  // comparte el espacio con la caja.
  const [giftPending, setGiftPending] = useState(false);
  const available = Math.max(110, Math.min(260, giftSpace - GIFT_LABEL_SPACE));
  const sharedWidth = (width - 48 - 16) / 2;
  const characterSize = giftPending ? Math.min(available, sharedWidth) : available;
  const giftSize = Math.max(110, Math.min(available, sharedWidth));

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
    <ScreenBackground color={sectionColors.Welcome}>
      <View className="flex-1 items-center px-6 pt-16">
        <Reveal className="w-full" offset={-18} duration={480}>
          <Heading style={{ fontSize: 40, lineHeight: 46 }}>
            {displayName ? t("welcome.greetingWithName", { name: displayName }) : t("welcome.greetingNoName")}
          </Heading>
          <Text className="mt-1 text-sm capitalize text-ink/70">
            {formatTime(now)} · {formatDate(now, lang)}
          </Text>
        </Reveal>

        {/* El personaje (y el regalo, si está pendiente) ocupan todo el espacio
            libre entre el reloj y los botones y se achican para caber. zIndex
            alto: si aun así algo se solapara, quedan por encima de los botones. */}
        <View
          style={{ flex: 1, zIndex: 10, elevation: 10, gap: 16 }}
          className="w-full flex-row items-center justify-center"
          onLayout={(e) => setGiftSpace(e.nativeEvent.layout.height)}
        >
          <Image
            source={require("../../../../assets/images/ImagenLogin.png")}
            style={{ width: characterSize, height: characterSize }}
            resizeMode="contain"
          />
          <TrialGiftBox size={giftSize} onVisibleChange={setGiftPending} />
        </View>

        <Text className="mt-2 text-base text-center text-ink">{t("welcome.subtitle")}</Text>

        {/* Grilla 2x2 de botones del mismo tamaño, outline blanco (manual). */}
        <Reveal className="w-full mt-4 mb-2" delay={200} offset={26} style={{ gap: 12 }}>
          {[
            [
              { label: t("welcome.openAgenda"), action: onOpenAgenda },
              { label: t("welcome.goPremium"), action: onOpenPaywall },
            ],
            [
              { label: t("welcome.viewResumen"), action: onOpenResumen },
              { label: t("welcome.settings"), action: onOpenConfiguracion },
            ],
          ].map((row, i) => (
            <View key={i} className="flex-row" style={{ gap: 12 }}>
              {row.map((item) => (
                <View key={item.label} className="flex-1">
                  <Button fullWidth variant="outlineWhite" label={item.label} onPress={withBurst(item.action)} />
                </View>
              ))}
            </View>
          ))}
        </Reveal>
      </View>

      <BottomIconBar
        items={[
          {
            key: "signOut",
            label: t("common.signOut"),
            icon: require("../../../../assets/images/log out.png"),
            onPress: withBurst(handleSignOut),
          },
          {
            key: "home",
            label: t("welcome.navHome"),
            icon: require("../../../../assets/images/home.png"),
            active: true,
          },
          {
            key: "agenda",
            label: t("welcome.navAgenda"),
            icon: require("../../../../assets/images/notas2.png"),
            onPress: withBurst(onOpenAgenda),
          },
        ]}
      />
    </ScreenBackground>
  );
}
