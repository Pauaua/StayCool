import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, Dimensions, Easing, Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme";
import { useClaimTrial, useProfile } from "@/features/home/hooks/useProfile";
import { useT } from "@/lib/i18n";
import { REMINDER_IDS, scheduleOneTimeReminder } from "@/notifications/notifications";

// Prueba gratuita de 3 días del plan Full, ofrecida como una caja de
// regalo (ilustración RegaloCerrado → RegaloAbierto al tocarla) en el panel
// principal. Se muestra mientras el usuario
// no la haya reclamado todavía (profile.trial_claimed_at == null),
// pagando o no — si ya es full de verdad no le hace ningún daño de todos
// modos. Todo el trabajo de "que no se pueda reclamar dos veces" vive en
// claim_trial() del lado del servidor (ver 0025_trial.sql), esto es solo
// la UI.
//
// Flujo: tocar el círculo activa la prueba (claim_trial()) y, si
// funciona, abre el modal de invitación con una lluvia de brillitos
// cayendo por toda la pantalla (mismo patrón que FallingCircles, ver
// SparkleRain acá abajo) — dura mientras el modal esté abierto, y para
// sola al cerrarlo (con la X o "Ir al Home"). El Modal vive fuera del
// "if" que oculta el círculo: si estuviera adentro, en cuanto
// claim_trial() invalida el perfil y trial_claimed_at deja de ser null,
// todo el componente (modal incluido) se desmontaría de golpe.
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const RAIN_COUNT = 26;

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function RainSparkle() {
  const progress = useRef(new Animated.Value(0)).current;
  const left = useRef(randomBetween(0, SCREEN_WIDTH - 24)).current;
  const size = useRef(randomBetween(12, 26)).current;
  const duration = useRef(randomBetween(2500, 5000)).current;
  const spinDirection = useRef(Math.random() > 0.5 ? "0deg" : "360deg").current;

  useEffect(() => {
    function loop() {
      progress.setValue(0);
      Animated.timing(progress, { toValue: 1, duration, useNativeDriver: true }).start(() => loop());
    }
    const initialDelay = setTimeout(loop, randomBetween(0, duration));
    return () => clearTimeout(initialDelay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [-30, SCREEN_HEIGHT + 30] });
  const opacity = progress.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 1, 1, 0] });
  const rotate = progress.interpolate({ inputRange: [0, 1], outputRange: ["0deg", spinDirection] });

  return (
    <Animated.View
      style={{ position: "absolute", left, width: size, height: size, opacity, transform: [{ translateY }, { rotate }] }}
    >
      <Image
        source={require("../../../../assets/images/brillitos.png")}
        style={{ width: size, height: size, tintColor: "#ffffff" }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

// Lluvia de brillitos por toda la pantalla, solo mientras el modal de la
// prueba gratuita está abierto. pointerEvents="none" para no bloquear el
// botón de cerrar.
function SparkleRain() {
  return (
    <Animated.View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: RAIN_COUNT }).map((_, i) => (
        <RainSparkle key={i} />
      ))}
    </Animated.View>
  );
}

// `size` es el lado del regalo (260 = tamaño completo). El contenedor lo
// achica cuando la pantalla es baja, para que el regalo y su mensaje siempre
// quepan sin quedar tapados por los botones. `onVisibleChange` avisa cuándo
// el regalo aparece o desaparece, para que el contenedor reparta el espacio.
export function TrialGiftBox({
  size = 260,
  onVisibleChange,
}: {
  size?: number;
  onVisibleChange?: (visible: boolean) => void;
}) {
  const k = size / 260;
  const { data: profile } = useProfile();
  const claimTrial = useClaimTrial();
  const { t } = useT();
  const [successVisible, setSuccessVisible] = useState(false);
  // Al tocar el regalo pasa a la ilustración abierta y queda así hasta cerrar
  // el modal (aunque claim_trial() ya haya marcado trial_claimed_at).
  const [opened, setOpened] = useState(false);
  const openPop = useRef(new Animated.Value(1)).current;

  const pulse = useRef(new Animated.Value(0)).current;
  const sparkleSpin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    const spin = Animated.loop(
      Animated.timing(sparkleSpin, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: true })
    );
    spin.start();
    return () => {
      loop.stop();
      spin.stop();
    };
  }, [pulse, sparkleSpin]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const rotate = sparkleSpin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  const showBox = opened || (!!profile && !profile.trial_claimed_at);

  useEffect(() => {
    onVisibleChange?.(showBox);
  }, [showBox, onVisibleChange]);

  function closeSuccess() {
    setSuccessVisible(false);
    setOpened(false);
  }

  async function handlePress() {
    if (claimTrial.isPending || opened) return;
    setOpened(true);
    openPop.setValue(0.85);
    Animated.spring(openPop, { toValue: 1, friction: 4, tension: 160, useNativeDriver: true }).start();
    try {
      const endsAt = await claimTrial.mutateAsync();
      // Aviso local justo cuando vence la prueba, para que sepa que volvió
      // a free y pueda decidir si renueva o se queda así.
      await scheduleOneTimeReminder(
        REMINDER_IDS.trialEnded,
        t("trial.endedNotifTitle"),
        t("trial.endedNotifBody"),
        new Date(endsAt)
      );
      setSuccessVisible(true);
    } catch (error) {
      setOpened(false);
      Alert.alert(t("trial.errorTitle"), error instanceof Error ? error.message : "Intenta de nuevo.");
    }
  }

  return (
    <>
      {showBox ? (
        <View className="items-center">
          <Pressable onPress={handlePress} disabled={claimTrial.isPending} hitSlop={12}>
            <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
              {/* Decoración: un par de brillitos girando alrededor del círculo. */}
              <Animated.View
                style={{ position: "absolute", width: 30 * k, height: 30 * k, top: 6 * k, left: 10 * k, transform: [{ rotate }] }}
              >
                <Image
                  source={require("../../../../assets/images/brillitos.png")}
                  style={{ width: 30 * k, height: 30 * k, tintColor: colors.ink }}
                  resizeMode="contain"
                />
              </Animated.View>
              <Animated.View
                style={{ position: "absolute", width: 22 * k, height: 22 * k, bottom: 10 * k, right: 4 * k, transform: [{ rotate }] }}
              >
                <Image
                  source={require("../../../../assets/images/brillitos.png")}
                  style={{ width: 22 * k, height: 22 * k, tintColor: colors.ink }}
                  resizeMode="contain"
                />
              </Animated.View>

              <Animated.View style={{ transform: [{ scale: opened ? openPop : scale }] }}>
                <Image
                  source={
                    opened
                      ? require("../../../../assets/images/RegaloAbierto.png")
                      : require("../../../../assets/images/RegaloCerrado.png")
                  }
                  style={{ width: 216 * k, height: 216 * k }}
                  resizeMode="contain"
                />
              </Animated.View>
            </View>
          </Pressable>
          <Text className="mt-2 text-base font-semibold" style={{ color: colors.ink }}>
            {t("trial.giftLabel")}
          </Text>
        </View>
      ) : null}

      <Modal visible={successVisible} transparent animationType="fade" onRequestClose={closeSuccess}>
        <View className="flex-1 items-center justify-center bg-black/50 px-8">
          {successVisible ? <SparkleRain /> : null}

          <View
          style={{ borderRadius: 24, padding: 24, width: "100%", alignItems: "center", backgroundColor: colors.rosado }}
        >
            <Pressable
              onPress={closeSuccess}
              hitSlop={12}
              style={{ position: "absolute", top: 14, right: 14, zIndex: 1 }}
            >
              <Text style={{ fontSize: 20, color: colors.ink }}>✕</Text>
            </Pressable>

            <Image
              source={require("../../../../assets/images/Logo.png")}
              style={{ width: 72, height: 72, borderRadius: 16, marginBottom: 12 }}
              resizeMode="contain"
            />

            <Text className="text-lg font-bold text-center mb-6" style={{ color: colors.ink }}>
              {t("trial.successMessage")}
            </Text>

            <Pressable
              onPress={closeSuccess}
              className="rounded-full px-8 py-3"
              style={{ backgroundColor: colors.white, borderWidth: 1, borderColor: colors.ink }}
            >
              <Text className="font-semibold text-ink">{t("trial.goHomeButton")}</Text>
            </Pressable>

            <Text className="text-xs text-center mt-4" style={{ color: colors.ink, opacity: 0.7 }}>
              {t("trial.disclaimer")}
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}
