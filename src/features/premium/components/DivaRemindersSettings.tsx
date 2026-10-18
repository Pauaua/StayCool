import React from "react";
import { Alert, Image, Text, View } from "react-native";
import { colors } from "@/theme";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StarToggle } from "@/components/ui/StarToggle";
import { usePremium } from "@/features/premium/hooks/usePremium";
import { useDivaRemindersSetting } from "@/notifications/diva/useDivaReminders";
import { fireDivaTestNotifications } from "@/notifications/diva/scheduler";
import { useT } from "@/lib/i18n";

// Único ajuste de los Recordatorios Diva: encenderlos o apagarlos. Solo se
// muestra a cuentas Diva (suscripción o prueba gratis).
export function DivaRemindersSettings() {
  const { isFull } = usePremium();
  const { enabled, setEnabled } = useDivaRemindersSetting();
  const { t, lang } = useT();

  if (!isFull) return null;

  async function handleToggle(value: boolean) {
    const result = await setEnabled(value);
    if (value && !result) {
      Alert.alert(t("divaReminders.permissionDeniedTitle"), t("divaReminders.permissionDeniedMessage"));
    }
  }

  async function handleDevTest() {
    const ok = await fireDivaTestNotifications(lang);
    Alert.alert(ok ? t("divaReminders.devTestScheduled") : t("divaReminders.permissionDeniedTitle"));
  }

  return (
    <Card className="mb-4" style={{ borderLeftWidth: 4, borderLeftColor: colors.morado }}>
      <View className="flex-row items-center mb-1">
        <Image
          source={require("../../../../assets/images/uñotas.png")}
          style={{ width: 24, height: 24, marginRight: 6 }}
          resizeMode="contain"
        />
        <Text className="text-base font-bold text-surface-dark dark:text-white">
          {t("divaReminders.settingsTitle")}
        </Text>
      </View>
      <Text className="text-sm text-gray-500 dark:text-gray-400 mb-3">{t("divaReminders.settingsSubtitle")}</Text>
      <StarToggle value={enabled} onValueChange={handleToggle} />
      {/* Solo en desarrollo: __DEV__ es false en cualquier build de Play. */}
      {__DEV__ ? (
        <View className="mt-3">
          <Button label={t("divaReminders.devTest")} variant="outline" onPress={handleDevTest} />
        </View>
      ) : null}
    </Card>
  );
}
