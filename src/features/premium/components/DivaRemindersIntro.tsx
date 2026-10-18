import React, { useState } from "react";
import { Alert, Image, Modal, Pressable, Text, View } from "react-native";
import { colors } from "@/theme";
import { usePremium } from "@/features/premium/hooks/usePremium";
import { PressableScale } from "@/components/ui/PressableScale";
import { TapSparkles } from "@/components/ui/TapSparkles";
import { useDivaRemindersSetting } from "@/notifications/diva/useDivaReminders";
import { useT } from "@/lib/i18n";

// Presentación de los Recordatorios Diva: aparece una vez cuando la cuenta
// pasa a Diva (suscripción o prueba gratis) y todavía no decidió si los
// quiere. Recién al tocar "Activar" se pide el permiso de notificaciones,
// así la persona sabe para qué es.
export function DivaRemindersIntro() {
  const { isFull, isLoading } = usePremium();
  const { decided, isLoaded, setEnabled } = useDivaRemindersSetting();
  const { t } = useT();
  const [busy, setBusy] = useState(false);
  const [sparkles, setSparkles] = useState(0);

  const visible = isFull && !isLoading && isLoaded && !decided;

  async function activate() {
    setSparkles((n) => n + 1);
    setBusy(true);
    const enabled = await setEnabled(true);
    setBusy(false);
    if (!enabled) {
      Alert.alert(t("divaReminders.permissionDeniedTitle"), t("divaReminders.permissionDeniedMessage"));
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setEnabled(false)}>
      <View className="flex-1 items-center justify-center bg-black/50 px-8">
        <View
          style={{ borderRadius: 24, padding: 24, width: "100%", alignItems: "center", backgroundColor: colors.rosado }}
        >
          <Image
            source={require("../../../../assets/images/uñotas.png")}
            style={{ width: 56, height: 56, marginBottom: 8 }}
            resizeMode="contain"
          />
          <Text className="text-xl font-bold text-center mb-2" style={{ color: colors.ink }}>
            {t("divaReminders.introTitle")}
          </Text>
          <Text className="text-base text-center mb-6" style={{ color: colors.ink }}>
            {t("divaReminders.introMessage")}
          </Text>

          <PressableScale
            wrapperClassName="w-full"
            className="rounded-full px-8 py-3 items-center"
            style={{ backgroundColor: colors.white, borderWidth: 1, borderColor: colors.ink, opacity: busy ? 0.6 : 1 }}
            onPress={busy ? undefined : activate}
          >
            <Text className="font-semibold text-ink">{t("divaReminders.introCta")}</Text>
            <TapSparkles trigger={sparkles} />
          </PressableScale>

          <Pressable onPress={() => setEnabled(false)} hitSlop={10} className="mt-4" disabled={busy}>
            <Text className="text-sm" style={{ color: colors.ink, opacity: 0.7 }}>
              {t("divaReminders.introLater")}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
