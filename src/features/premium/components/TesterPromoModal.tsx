import React, { useEffect, useState } from "react";
import { Image, Modal, Text, View } from "react-native";
import { colors } from "@/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
        <View
          style={{ borderRadius: 24, padding: 24, width: "100%", alignItems: "center", backgroundColor: colors.rosado }}
        >
          <Image
            source={require("../../../../assets/images/brillitos.png")}
            style={{ width: 44, height: 44, marginBottom: 8, tintColor: colors.ink }}
            resizeMode="contain"
          />
          <Text className="text-xl font-bold text-center mb-6" style={{ color: colors.ink }}>
            {t("testerPromo.message")}
          </Text>

          <PressableScale
            wrapperClassName="w-full"
            className="rounded-full px-8 py-3 items-center"
            style={{ backgroundColor: colors.white, borderWidth: 1, borderColor: colors.ink }}
            onPress={() => {
              setSparkles((n) => n + 1);
              close();
            }}
          >
            <Text className="font-semibold text-ink">{t("testerPromo.cta")}</Text>
            <TapSparkles trigger={sparkles} />
          </PressableScale>
        </View>
      </View>
    </Modal>
  );
}
