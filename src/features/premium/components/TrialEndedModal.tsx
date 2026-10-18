import React, { useEffect, useState } from "react";
import { Image, Modal, Pressable, Text, View } from "react-native";
import { colors } from "@/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useProfile } from "@/features/home/hooks/useProfile";
import { usePremium } from "@/features/premium/hooks/usePremium";
import { PressableScale } from "@/components/ui/PressableScale";
import { TapSparkles } from "@/components/ui/TapSparkles";
import { useT } from "@/lib/i18n";

// Aviso que aparece cuando se acaba la prueba gratuita de Diva y la cuenta
// vuelve al plan gratis. La prueba es un regalo (no crea ninguna suscripción
// ni cobro), así que aquí solo se informa y se ofrece suscribirse.
//
// Se muestra una sola vez por prueba: al cerrarlo guardamos en el dispositivo
// qué prueba ya se avisó (clave = usuario + fecha de vencimiento). Aparece
// tanto si la app estaba cerrada cuando venció como si estaba abierta (el
// PremiumProvider re-evalúa el plan justo al vencer).
export function TrialEndedModal({ onSubscribe }: { onSubscribe: () => void }) {
  const { session } = useAuth();
  const { data: profile } = useProfile();
  const { tier, isLoading } = usePremium();
  const { t } = useT();
  const [alreadySeen, setAlreadySeen] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [sparkles, setSparkles] = useState(0);

  const userId = session?.user.id;
  const endsAt = profile?.trial_ends_at ?? null;
  const storageKey = userId && endsAt ? `trial-ended-seen:${userId}:${endsAt}` : null;

  useEffect(() => {
    setDismissed(false);
    setAlreadySeen(null);
    if (!storageKey) return;
    let cancelled = false;
    AsyncStorage.getItem(storageKey)
      .then((value) => {
        if (!cancelled) setAlreadySeen(value === "1");
      })
      .catch(() => {
        if (!cancelled) setAlreadySeen(false);
      });
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  const trialExpired = Boolean(endsAt) && new Date(endsAt as string) <= new Date();
  const visible = trialExpired && !isLoading && tier === "free" && alreadySeen === false && !dismissed;

  function close(action?: () => void) {
    setDismissed(true);
    if (storageKey) AsyncStorage.setItem(storageKey, "1").catch(() => {});
    action?.();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => close()}>
      <View className="flex-1 items-center justify-center bg-black/50 px-8">
        <View
          style={{ borderRadius: 24, padding: 24, width: "100%", alignItems: "center", backgroundColor: colors.rosado }}
        >
          <Image
            source={require("../../../../assets/images/brillitos.png")}
            style={{ width: 44, height: 44, marginBottom: 8, tintColor: colors.ink }}
            resizeMode="contain"
          />
          <Text className="text-xl font-bold text-center mb-2" style={{ color: colors.ink }}>
            {t("trial.endedModalTitle")}
          </Text>
          <Text className="text-base text-center mb-6" style={{ color: colors.ink }}>
            {t("trial.endedModalMessage")}
          </Text>

          <PressableScale
            wrapperClassName="w-full"
            className="rounded-full px-8 py-3 items-center"
            style={{ backgroundColor: colors.white, borderWidth: 1, borderColor: colors.ink }}
            onPress={() => {
              setSparkles((n) => n + 1);
              close(onSubscribe);
            }}
          >
            <Text className="font-semibold text-ink">{t("trial.endedModalCta")}</Text>
            <TapSparkles trigger={sparkles} />
          </PressableScale>

          <Pressable onPress={() => close()} hitSlop={10} className="mt-4">
            <Text className="text-sm" style={{ color: colors.ink, opacity: 0.7 }}>
              {t("trial.endedModalClose")}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
