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
export function TrialGiftBox() {
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

  if (!profile || profile.trial_claimed_at) return null;

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] });
  const rotate = sparkleSpin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  async function handlePress() {
    try {
      await claimTrial.mutateAsync();
      setSuccessVisible(true);
    } catch (error) {
      Alert.alert(t("trial.errorTitle"), error instanceof Error ? error.message : "Intenta de nuevo.");
    }
  }

  return (
    <>
      <View className="items-center">
        <Pressable onPress={handlePress} disabled={claimTrial.isPending} hitSlop={12}>
          <View style={{ width: 96, height: 96, alignItems: "center", justifyContent: "center" }}>
            <Animated.View
              style={{
                position: "absolute",
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: "#a9d8ff",
                opacity: glowOpacity,
                transform: [{ scale }],
              }}
            />
            <Animated.View
              style={{
                position: "absolute",
                width: 20,
                height: 20,
                top: -2,
                left: 4,
                transform: [{ rotate }],
              }}
            >
              <Image source={require("../../../../assets/images/brillitos.png")} style={{ width: 20, height: 20 }} resizeMode="contain" />
            </Animated.View>
            <Animated.View
              style={{
                position: "absolute",
                width: 16,
                height: 16,
                bottom: 2,
                right: 0,
                transform: [{ rotate }],
              }}
            >
              <Image source={require("../../../../assets/images/brillitos.png")} style={{ width: 16, height: 16 }} resizeMode="contain" />
            </Animated.View>

            <Animated.View style={{ transform: [{ scale }] }}>
              <LinearGradient
                colors={["#d9ebff", "#ecc6ff", "#ebfff7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  borderColor: "#ffffff",
                }}
              >
                <Text style={{ fontSize: 36 }}>🎁</Text>
              </LinearGradient>
            </Animated.View>
          </View>
        </Pressable>
        <Text className="mt-2 text-sm font-semibold" style={{ color: "#002054" }}>
          {t("trial.giftLabel")}
        </Text>
      </View>

      <Modal visible={successVisible} transparent animationType="fade" onRequestClose={() => setSuccessVisible(false)}>
        <View className="flex-1 items-center justify-center bg-black/50 px-8">
          <LinearGradient
            colors={["#d9ebff", "#ecc6ff", "#ebfff7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 24, padding: 24, width: "100%", alignItems: "center" }}
          >
            <Text style={{ fontSize: 48, marginBottom: 8 }}>🎉</Text>

            <View className="flex-row flex-wrap items-center justify-center mb-1">
              <Text className="text-lg font-bold text-center" style={{ color: "#002054" }}>
                {t("trial.successLine1")}{" "}
              </Text>
              <Image
                source={require("../../../../assets/images/uñotas.png")}
                style={{ width: 26, height: 26 }}
                resizeMode="contain"
              />
              <Text className="text-lg font-bold text-center" style={{ color: "#002054" }}>
                {" "}{t("trial.successLine1Suffix")}
              </Text>
            </View>

            <View className="flex-row flex-wrap items-center justify-center mb-5">
              <Text className="text-base text-center" style={{ color: "#002054" }}>
                {t("trial.successLine2")}{" "}
              </Text>
              <Image
                source={require("../../../../assets/images/brillitos.png")}
                style={{ width: 22, height: 22 }}
                resizeMode="contain"
              />
            </View>

            <Pressable
              onPress={() => setSuccessVisible(false)}
              className="rounded-full px-8 py-3"
              style={{ backgroundColor: "#002054" }}
            >
              <Text className="font-semibold text-white">{t("trial.closeButton")}</Text>
            </Pressable>
          </LinearGradient>
        </View>
      </Modal>
    </>
  );
}
