import React from "react";
import { Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { StarToggle } from "@/components/ui/StarToggle";
import { useProfile, useUpdateProfile } from "@/features/home/hooks/useProfile";
import { useT } from "@/lib/i18n";

// Antes vivía en Ajustes; se movió acá abajo del resumen del día para poder
// configurar los recordatorios sin salir de la agenda.
export function ReminderSettings() {
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const { t } = useT();

  if (!profile) return null;

  return (
    <View className="mt-6">
      <Text className="text-lg font-bold text-surface-dark dark:text-white mb-3">
        {t("reminders.title")}
      </Text>

      <Card className="mb-4">
        <Text className="text-surface-dark dark:text-white mb-2">{t("reminders.makeup")}</Text>
        <StarToggle
          value={profile.makeup_reminder_enabled}
          onValueChange={(value) => update.mutate({ makeup_reminder_enabled: value })}
        />
        {profile.makeup_reminder_enabled ? (
          <View className="mt-3">
            <TextField
              label={t("reminders.timeLabel")}
              defaultValue={profile.makeup_reminder_time.slice(0, 5)}
              onEndEditing={(e) => update.mutate({ makeup_reminder_time: `${e.nativeEvent.text}:00` })}
            />
          </View>
        ) : null}
      </Card>

      <Card className="mb-4">
        <Text className="text-surface-dark dark:text-white mb-2">{t("reminders.hygiene")}</Text>
        <StarToggle
          value={profile.hygiene_reminder_enabled}
          onValueChange={(value) => update.mutate({ hygiene_reminder_enabled: value })}
        />
        {profile.hygiene_reminder_enabled ? (
          <View className="mt-3">
            <TextField
              label={t("reminders.timeLabel")}
              defaultValue={profile.hygiene_reminder_time.slice(0, 5)}
              onEndEditing={(e) => update.mutate({ hygiene_reminder_time: `${e.nativeEvent.text}:00` })}
            />
          </View>
        ) : null}
      </Card>

      <Card className="mb-4">
        <Text className="text-surface-dark dark:text-white mb-2">{t("reminders.skincareMorning")}</Text>
        <StarToggle
          value={profile.skincare_morning_reminder_enabled}
          onValueChange={(value) => update.mutate({ skincare_morning_reminder_enabled: value })}
        />
        {profile.skincare_morning_reminder_enabled ? (
          <View className="mt-3">
            <TextField
              label={t("reminders.timeLabel")}
              defaultValue={profile.skincare_morning_reminder_time.slice(0, 5)}
              onEndEditing={(e) =>
                update.mutate({ skincare_morning_reminder_time: `${e.nativeEvent.text}:00` })
              }
            />
          </View>
        ) : null}
      </Card>

      <Card className="mb-4">
        <Text className="text-surface-dark dark:text-white mb-2">{t("reminders.skincareNight")}</Text>
        <StarToggle
          value={profile.skincare_night_reminder_enabled}
          onValueChange={(value) => update.mutate({ skincare_night_reminder_enabled: value })}
        />
        {profile.skincare_night_reminder_enabled ? (
          <View className="mt-3">
            <TextField
              label={t("reminders.timeLabel")}
              defaultValue={profile.skincare_night_reminder_time.slice(0, 5)}
              onEndEditing={(e) =>
                update.mutate({ skincare_night_reminder_time: `${e.nativeEvent.text}:00` })
              }
            />
          </View>
        ) : null}
      </Card>
    </View>
  );
}
