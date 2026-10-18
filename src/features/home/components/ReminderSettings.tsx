import React from "react";
import { Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { StarToggle } from "@/components/ui/StarToggle";
import { useProfile, useUpdateProfile } from "@/features/home/hooks/useProfile";
import type { Profile } from "@/features/home/types";
import { useT, type TranslationKey } from "@/lib/i18n";

type ReminderKind = "makeup" | "hygiene" | "skincare_morning" | "skincare_night";

const REMINDERS: { kind: ReminderKind; labelKey: TranslationKey }[] = [
  { kind: "makeup", labelKey: "reminders.makeup" },
  { kind: "hygiene", labelKey: "reminders.hygiene" },
  { kind: "skincare_morning", labelKey: "reminders.skincareMorning" },
  { kind: "skincare_night", labelKey: "reminders.skincareNight" },
];

// Antes vivía en Ajustes; se movió acá abajo del resumen del día para poder
// configurar los recordatorios sin salir de la agenda. Tarjetas blancas en
// grilla de 2 columnas, cada una con su interruptor sol/luna y, si está
// activo, la hora.
export function ReminderSettings() {
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const { t } = useT();

  if (!profile) return null;

  function renderCard({ kind, labelKey }: (typeof REMINDERS)[number]) {
    const enabledKey = `${kind}_reminder_enabled` as const;
    const timeKey = `${kind}_reminder_time` as const;
    const enabled = profile![enabledKey];

    return (
      <Card key={kind} className="flex-1">
        <Text className="text-sm font-semibold text-ink mb-3">{t(labelKey)}</Text>
        <StarToggle
          value={enabled}
          onValueChange={(value) => update.mutate({ [enabledKey]: value } as Partial<Profile>)}
        />
        {enabled ? (
          <View className="mt-3">
            <TextField
              label={t("reminders.timeLabel")}
              defaultValue={profile![timeKey].slice(0, 5)}
              onEndEditing={(e) => update.mutate({ [timeKey]: `${e.nativeEvent.text}:00` } as Partial<Profile>)}
            />
          </View>
        ) : null}
      </Card>
    );
  }

  return (
    <View className="mt-3" style={{ gap: 12 }}>
      {[REMINDERS.slice(0, 2), REMINDERS.slice(2, 4)].map((row, i) => (
        <View key={i} className="flex-row items-start" style={{ gap: 12 }}>
          {row.map(renderCard)}
        </View>
      ))}
    </View>
  );
}
