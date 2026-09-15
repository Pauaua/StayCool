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
// Flujo: tocar la caja abre el popup de invitación (todavía no activa
// nada); recién al cerrar ese popup se llama claim_trial(). El Modal vive
// fuera del "if" que oculta la caja — si estuviera adentro, en cuanto
// claim_trial() invalida el perfil y trial_claimed_at deja de ser null,
// todo el componente (popup incluido) se desmontaría de golpe.
export function TrialGiftBox() {
  const { data: profile } = useProfile();
  const claimTrial = useClaimTrial();
  const { t } = useT();
  const [inviteVisible, setInviteVisible] = useState(false);

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
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] });
  const rotate = sparkleSpin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  const showBox = !!profile && !profile.trial_claimed_at;

  async function handleAccept() {
    setInviteVisible(false);
    try {
      await claimTrial.mutateAsync();
    } catch (error) {
      Alert.alert(t("trial.errorTitle"), error instanceof Error ? error.message : "Intenta de nuevo.");
    }
  }

  return (
    <>
      {showBox ? (
        <View className="items-center">
          <Pressable onPress={() => setInviteVisible(true)} hitSlop={12}>
            <View style={{ width: 192, height: 192, alignItems: "center", justifyContent: "center" }}>
              <Animated.View
                style={{
                  position: "absolute",
                  width: 192,
                  height: 192,
                  borderRadius: 96,
                  backgroundColor: "#a9d8ff",
                  opacity: glowOpacity,
                  transform: [{ scale }],
                }}
              />
              <Animated.View
                style={{ position: "absolute", width: 36, height: 36, top: -4, left: 8, transform: [{ rotate }] }}
              >
                <Image
                  source={require("../../../../assets/images/brillitos.png")}
                  style={{ width: 36, height: 36 }}
                  resizeMode="contain"
                />
              </Animated.View>
              <Animated.View
                style={{ position: "absolute", width: 28, height: 28, bottom: 4, right: 0, transform: [{ rotate }] }}
              >
                <Image
                  source={require("../../../../assets/images/brillitos.png")}
                  style={{ width: 28, height: 28 }}
                  resizeMode="contain"
                />
              </Animated.View>

              <Animated.View style={{ transform: [{ scale }] }}>
                <LinearGradient
                  colors={["#d9ebff", "#ecc6ff", "#ebfff7"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 144,
                    height: 144,
                    borderRadius: 36,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 3,
                    borderColor: "#ffffff",
                  }}
                >
                  <Text style={{ fontSize: 68 }}>🎁</Text>
                </LinearGradient>
              </Animated.View>
            </View>
          </Pressable>
          <Text className="mt-2 text-base font-semibold" style={{ color: "#002054" }}>
            {t("trial.giftLabel")}
          </Text>
        </View>
      ) : null}

      <Modal visible={inviteVisible} transparent animationType="fade" onRequestClose={handleAccept}>
        <View className="flex-1 items-center justify-center bg-black/50 px-8">
          <LinearGradient
            colors={["#d9ebff", "#ecc6ff", "#ebfff7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 24, padding: 24, width: "100%", alignItems: "center" }}
          >
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🎁</Text>

            <Text className="text-lg font-bold text-center mb-6" style={{ color: "#002054" }}>
              {t("trial.inviteMessage")}
            </Text>

            <Pressable onPress={handleAccept} className="rounded-full px-8 py-3" style={{ backgroundColor: "#002054" }}>
              <Text className="font-semibold text-white">{t("trial.closeButton")}</Text>
            </Pressable>
          </LinearGradient>
        </View>
      </Modal>
    </>
  );
}
