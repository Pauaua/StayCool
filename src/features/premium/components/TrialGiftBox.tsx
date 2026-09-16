import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, Easing, Image, Modal, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useClaimTrial, useProfile } from "@/features/home/hooks/useProfile";
import { useT } from "@/lib/i18n";

// Prueba gratuita de 3 días del plan Full, ofrecida como una caja de
// regalo brillante en el panel principal. Se muestra mientras el usuario
// no la haya reclamado todavía (profile.trial_claimed_at == null),
// pagando o no — si ya es full de verdad no le hace ningún daño de todos
// modos. Todo el trabajo de "que no se pueda reclamar dos veces" vive en
// claim_trial() del lado del servidor (ver 0025_trial.sql), esto es solo
// la UI.
//
// Flujo: tocar la caja dispara una explosión de brillitos que se
// desvanecen, activa la prueba (claim_trial()) y, si funciona, abre el
// modal de confirmación. El Modal vive fuera del "if" que oculta la caja
// — si estuviera adentro, en cuanto claim_trial() invalida el perfil y
// trial_claimed_at deja de ser null, todo el componente (modal incluido)
// se desmontaría de golpe.
const SPARKLES = [
  { size: 40, top: -10, left: 4 },
  { size: 26, top: 16, right: -6 },
  { size: 22, bottom: 10, left: -8 },
  { size: 34, bottom: -8, right: 10 },
  { size: 18, top: 40, left: -4 },
] as const;

const BURST_COUNT = 24;
const BURST_MIN_DISTANCE = 90;
const BURST_MAX_DISTANCE = 220;

export function TrialGiftBox() {
  const { data: profile } = useProfile();
  const claimTrial = useClaimTrial();
  const { t } = useT();
  const [successVisible, setSuccessVisible] = useState(false);
  const [bursting, setBursting] = useState(false);

  const pulse = useRef(new Animated.Value(0)).current;
  const sparkleSpin = useRef(new Animated.Value(0)).current;
  const burstProgress = useRef(new Animated.Value(0)).current;

  // Ángulo y distancia de cada brillito de la explosión, calculados una
  // sola vez: repartidos parejo en el círculo con un poco de jitter para
  // que no se vea un patrón perfecto/artificial.
  const burstParticles = useMemo(
    () =>
      Array.from({ length: BURST_COUNT }, (_, i) => {
        const angle = (i / BURST_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const distance = BURST_MIN_DISTANCE + Math.random() * (BURST_MAX_DISTANCE - BURST_MIN_DISTANCE);
        return {
          dx: Math.cos(angle) * distance,
          dy: Math.sin(angle) * distance,
          size: 14 + Math.random() * 22,
        };
      }),
    []
  );

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
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.85] });
  const rotate = sparkleSpin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const rotateReverse = sparkleSpin.interpolate({ inputRange: [0, 1], outputRange: ["360deg", "0deg"] });

  const showBox = !!profile && !profile.trial_claimed_at;

  function handlePress() {
    if (bursting || claimTrial.isPending) return;
    setBursting(true);
    burstProgress.setValue(0);
    Animated.timing(burstProgress, {
      toValue: 1,
      duration: 750,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(async () => {
      setBursting(false);
      try {
        await claimTrial.mutateAsync();
        setSuccessVisible(true);
      } catch (error) {
        Alert.alert(t("trial.errorTitle"), error instanceof Error ? error.message : "Intenta de nuevo.");
      }
    });
  }

  return (
    <>
      {showBox ? (
        <View className="items-center">
          <Pressable onPress={handlePress} disabled={bursting || claimTrial.isPending} hitSlop={12}>
            <View style={{ width: 288, height: 288, alignItems: "center", justifyContent: "center" }}>
              {bursting
                ? burstParticles.map((p, i) => {
                    const translateX = burstProgress.interpolate({ inputRange: [0, 1], outputRange: [0, p.dx] });
                    const translateY = burstProgress.interpolate({ inputRange: [0, 1], outputRange: [0, p.dy] });
                    const opacity = burstProgress.interpolate({
                      inputRange: [0, 0.15, 1],
                      outputRange: [0, 1, 0],
                    });
                    const burstScale = burstProgress.interpolate({
                      inputRange: [0, 0.15, 1],
                      outputRange: [0.4, 1.2, 0.7],
                    });
                    return (
                      <Animated.View
                        key={i}
                        style={{
                          position: "absolute",
                          width: p.size,
                          height: p.size,
                          opacity,
                          transform: [{ translateX }, { translateY }, { scale: burstScale }],
                        }}
                      >
                        <Image
                          source={require("../../../../assets/images/brillitos.png")}
                          style={{ width: p.size, height: p.size, tintColor: "#ffffff" }}
                          resizeMode="contain"
                        />
                      </Animated.View>
                    );
                  })
                : null}

              <Animated.View
                style={{
                  position: "absolute",
                  width: 288,
                  height: 288,
                  borderRadius: 144,
                  backgroundColor: "#ffffff",
                  opacity: glowOpacity,
                  transform: [{ scale }],
                }}
              />
              <Animated.View
                style={{
                  position: "absolute",
                  width: 240,
                  height: 240,
                  borderRadius: 120,
                  backgroundColor: "#a9d8ff",
                  opacity: glowOpacity,
                  transform: [{ scale }],
                }}
              />

              {SPARKLES.map((s, i) => (
                <Animated.View
                  key={i}
                  style={{
                    position: "absolute",
                    width: s.size,
                    height: s.size,
                    top: "top" in s ? s.top : undefined,
                    bottom: "bottom" in s ? s.bottom : undefined,
                    left: "left" in s ? s.left : undefined,
                    right: "right" in s ? s.right : undefined,
                    transform: [{ rotate: i % 2 === 0 ? rotate : rotateReverse }],
                    opacity: glowOpacity,
                  }}
                >
                  <Image
                    source={require("../../../../assets/images/brillitos.png")}
                    style={{ width: s.size, height: s.size, tintColor: "#ffffff" }}
                    resizeMode="contain"
                  />
                </Animated.View>
              ))}

              <Animated.View style={{ transform: [{ scale }] }}>
                <LinearGradient
                  colors={["#ffffff", "#d9ebff", "#a9d8ff"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 216,
                    height: 216,
                    borderRadius: 54,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 4,
                    borderColor: "#ffffff",
                  }}
                >
                  <Text style={{ fontSize: 100 }}>🎁</Text>
                </LinearGradient>
              </Animated.View>
            </View>
          </Pressable>
          <Text className="mt-2 text-base font-semibold" style={{ color: "#002054" }}>
            {t("trial.giftLabel")}
          </Text>
        </View>
      ) : null}

      <Modal visible={successVisible} transparent animationType="fade" onRequestClose={() => setSuccessVisible(false)}>
        <View className="flex-1 items-center justify-center bg-black/50 px-8">
          <LinearGradient
            colors={["#d9ebff", "#ecc6ff", "#ebfff7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 24, padding: 24, width: "100%", alignItems: "center" }}
          >
            <Pressable
              onPress={() => setSuccessVisible(false)}
              hitSlop={12}
              style={{ position: "absolute", top: 14, right: 14, zIndex: 1 }}
            >
              <Text style={{ fontSize: 20, color: "#002054" }}>✕</Text>
            </Pressable>

            <Image
              source={require("../../../../assets/images/Logo.jpg")}
              style={{ width: 72, height: 72, borderRadius: 16, marginBottom: 12 }}
              resizeMode="contain"
            />

            <Text className="text-lg font-bold text-center mb-6" style={{ color: "#002054" }}>
              {t("trial.successMessage")}
            </Text>

            <Pressable
              onPress={() => setSuccessVisible(false)}
              className="rounded-full px-8 py-3"
              style={{ backgroundColor: "#002054" }}
            >
              <Text className="font-semibold text-white">{t("trial.goHomeButton")}</Text>
            </Pressable>
          </LinearGradient>
        </View>
      </Modal>
    </>
  );
}
