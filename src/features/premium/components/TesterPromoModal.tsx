import React, { useEffect, useState } from "react";
import { Image, Modal, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { isTesterPromoActive } from "@/features/premium/hooks/usePremium";
import { PressableScale } from "@/components/ui/PressableScale";
import { TapSparkles } from "@/components/ui/TapSparkles";
import { useT } from "@/lib/i18n";

// Aviso de la promo de testeo (ver TESTER_PROMO_ENDS_AT en usePremium): se
// muestra una sola vez por dispositivo al abrir la app actualizada, y solo
// mientras la promo siga vigente.
const STORAGE_KEY = "tester-promo-seen";

export function TesterPromoModal() {
  const { t } = useT();
  const [alreadySeen, setAlreadySeen] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [sparkles, setSparkles] = useState(0);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (!cancelled) setAlreadySeen(value === "1");
      })
      .catch(() => {
        if (!cancelled) setAlreadySeen(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = isTesterPromoActive() && alreadySeen === false && !dismissed;

  function close() {
    setDismissed(true);
    AsyncStorage.setItem(STORAGE_KEY, "1").catch(() => {});
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View className="flex-1 items-center justify-center bg-black/50 px-8">
        <LinearGradient
          colors={["#d9ebff", "#ecc6ff", "#ebfff7"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 24, padding: 24, width: "100%", alignItems: "center" }}
        >
          <Image
            source={require("../../../../assets/images/brillitos.png")}
            style={{ width: 44, height: 44, marginBottom: 8, tintColor: "#002054" }}
            resizeMode="contain"
          />
          <Text className="text-xl font-bold text-center mb-6" style={{ color: "#002054" }}>
            {t("testerPromo.message")}
          </Text>

          <PressableScale
            wrapperClassName="w-full"
            className="rounded-full px-8 py-3 items-center"
            style={{ backgroundColor: "#002054" }}
            onPress={() => {
              setSparkles((n) => n + 1);
              close();
            }}
          >
            <Text className="font-semibold text-white">{t("testerPromo.cta")}</Text>
            <TapSparkles trigger={sparkles} />
          </PressableScale>
        </LinearGradient>
      </View>
    </Modal>
  );
}
