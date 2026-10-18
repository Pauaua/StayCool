import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, Dimensions, Easing, Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "@/theme";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useClaimTrial, useProfile } from "@/features/home/hooks/useProfile";
import { useT } from "@/lib/i18n";
import { REMINDER_IDS, scheduleOneTimeReminder } from "@/notifications/notifications";

// Prueba gratuita de 3 días del plan Full, ofrecida como una caja de
// regalo (ilustración RegaloCerrado → RegaloAbierto al tocarla) en el panel
// principal. La primera vez que la usuaria entra con el regalo pendiente, el
// regalo aparece a pantalla completa para que lo abra; si lo deja para más
// tarde, queda como una cajita pequeña junto al saludo (que lo vuelve a
// mostrar en grande al tocarla). Se muestra mientras el usuario
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

// Clave por usuaria: el regalo a pantalla completa se muestra solo una vez.
const introSeenKey = (userId: string) => `trialGiftIntroSeen:${userId}`;

// `size` es el lado de la cajita pequeña que queda junto al saludo.
export function TrialGiftBox({ size = 48 }: { size?: number }) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { data: profile } = useProfile();
  const claimTrial = useClaimTrial();
  const { t } = useT();
  const [introVisible, setIntroVisible] = useState(false);
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

  const pending = !!profile && !profile.trial_claimed_at;

  // Primera vez con el regalo pendiente: se abre a pantalla completa.
  useEffect(() => {
    if (!pending || !userId) return;
    let cancelled = false;
    AsyncStorage.getItem(introSeenKey(userId))
      .then((seen) => {
        if (!cancelled && !seen) setIntroVisible(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pending, userId]);

  function markIntroSeen() {
    if (userId) AsyncStorage.setItem(introSeenKey(userId), "1").catch(() => {});
  }

  function closeIntro() {
    markIntroSeen();
    setIntroVisible(false);
  }

  function closeSuccess() {
    setSuccessVisible(false);
    setOpened(false);
  }

  async function handleOpenGift() {
    if (claimTrial.isPending || opened) return;
    markIntroSeen();
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
      setIntroVisible(false);
      setSuccessVisible(true);
    } catch (error) {
      setOpened(false);
      Alert.alert(t("trial.errorTitle"), error instanceof Error ? error.message : t("common.tryAgain"));
    }
  }

  const bigSize = Math.min(SCREEN_WIDTH * 0.8, 340);
  const k = bigSize / 260;

  return (
    <>
      {pending ? (
        <Pressable onPress={() => setIntroVisible(true)} hitSlop={12} accessibilityLabel={t("trial.giftLabel")}>
          <Animated.View style={{ transform: [{ scale }] }}>
            <Image
              source={require("../../../../assets/images/RegaloCerrado.png")}
              style={{ width: size, height: size }}
              resizeMode="contain"
            />
          </Animated.View>
        </Pressable>
      ) : null}

      {/* Un solo Modal para el regalo grande y el mensaje de éxito: en Android
          dos Modals encadenados pueden dejar el segundo sin mostrarse. */}
      <Modal
        visible={introVisible || successVisible}
        transparent
        animationType="fade"
        onRequestClose={successVisible ? closeSuccess : closeIntro}
      >
        <View className="flex-1 items-center justify-center bg-black/60 px-8">
          {successVisible ? (
            <>
              <SparkleRain />
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
            </>
          ) : (
            <>
              <Heading className="text-center mb-4" style={{ fontSize: 32, lineHeight: 38, color: colors.white }}>
                {t("trial.giftLabel")}
              </Heading>

              <Pressable onPress={handleOpenGift} disabled={claimTrial.isPending}>
                <View style={{ width: bigSize, height: bigSize, alignItems: "center", justifyContent: "center" }}>
                  {/* Decoración: un par de brillitos girando alrededor del regalo. */}
                  <Animated.View
                    style={{ position: "absolute", width: 30 * k, height: 30 * k, top: 6 * k, left: 10 * k, transform: [{ rotate }] }}
                  >
                    <Image
                      source={require("../../../../assets/images/brillitos.png")}
                      style={{ width: 30 * k, height: 30 * k, tintColor: colors.white }}
                      resizeMode="contain"
                    />
                  </Animated.View>
                  <Animated.View
                    style={{ position: "absolute", width: 22 * k, height: 22 * k, bottom: 10 * k, right: 4 * k, transform: [{ rotate }] }}
                  >
                    <Image
                      source={require("../../../../assets/images/brillitos.png")}
                      style={{ width: 22 * k, height: 22 * k, tintColor: colors.white }}
                      resizeMode="contain"
                    />
                  </Animated.View>

                  {/* Las ilustraciones son de línea negra: van sobre un círculo
                      blanco para que se vean sobre el fondo oscurecido. */}
                  <Animated.View
                    style={{
                      width: 230 * k,
                      height: 230 * k,
                      borderRadius: 115 * k,
                      backgroundColor: colors.white,
                      alignItems: "center",
                      justifyContent: "center",
                      transform: [{ scale: opened ? openPop : scale }],
                    }}
                  >
                    <Image
                      source={
                        opened
                          ? require("../../../../assets/images/RegaloAbierto.png")
                          : require("../../../../assets/images/RegaloCerrado.png")
                      }
                      style={{ width: 180 * k, height: 180 * k }}
                      resizeMode="contain"
                    />
                  </Animated.View>
                </View>
              </Pressable>

              <Text className="mt-2 mb-6 text-base text-center" style={{ color: colors.white }}>
                {t("trial.tapToOpen")}
              </Text>

              <Button variant="outlineWhite" label={t("trial.later")} onPress={closeIntro} />
            </>
          )}
        </View>
      </Modal>
    </>
  );
}
