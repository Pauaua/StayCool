import React, { useEffect, useRef, useState } from "react";
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
// Flujo: tocar la caja activa la prueba (claim_trial()) y, si funciona,
// abre el modal de confirmación. El Modal vive fuera del "if" que oculta
// la caja — si estuviera adentro, en cuanto claim_trial() invalida el
// perfil y trial_claimed_at deja de ser null, todo el componente (modal
// incluido) se desmontaría de golpe.
const SPARKLES = [
  { size: 40, top: -10, left: 4, delay: 0 },
  { size: 26, top: 16, right: -6, delay: 150 },
  { size: 22, bottom: 10, left: -8, delay: 300 },
  { size: 34, bottom: -8, right: 10, delay: 450 },
  { size: 18, top: 40, left: -4, delay: 600 },
] as const;

export function TrialGiftBox({ onOpenAgenda }: { onOpenAgenda: () => void }) {
  const { data: profile } = useProfile();
  const claimTrial = useClaimTrial();
  const { t } = useT();
  const [successVisible, setSuccessVisible] = useState(false);

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
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.85] });
  const rotate = sparkleSpin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const rotateReverse = sparkleSpin.interpolate({ inputRange: [0, 1], outputRange: ["360deg", "0deg"] });

  const showBox = !!profile && !profile.trial_claimed_at;

  async function handlePress() {
    try {
      await claimTrial.mutateAsync();
      setSuccessVisible(true);
    } catch (error) {
      Alert.alert(t("trial.errorTitle"), error instanceof Error ? error.message : "Intenta de nuevo.");
    }
  }

  function handleGoToAgenda() {
    setSuccessVisible(false);
    onOpenAgenda();
  }

  return (
    <>
      {showBox ? (
        <View className="items-center">
          <Pressable onPress={handlePress} disabled={claimTrial.isPending} hitSlop={12}>
            <View style={{ width: 288, height: 288, alignItems: "center", justifyContent: "center" }}>
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
              onPress={handleGoToAgenda}
              className="rounded-full px-8 py-3"
              style={{ backgroundColor: "#002054" }}
            >
              <Text className="font-semibold text-white">{t("trial.goToAgendaButton")}</Text>
            </Pressable>
          </LinearGradient>
        </View>
      </Modal>
    </>
  );
}
