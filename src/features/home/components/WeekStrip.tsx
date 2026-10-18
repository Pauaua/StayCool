import React from "react";
import { Text, View } from "react-native";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { useT } from "@/lib/i18n";
import { colors } from "@/theme";

const DAY_SIZE = 36;

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Mes y año actual + la semana en curso (lunes a domingo) con el número de
// cada día en un círculo; hoy queda resaltado en amarillo baby.
export function WeekStrip() {
  const { lang } = useT();
  const locale = lang === "en" ? enUS : es;
  const today = new Date();
  const monday = startOfWeek(today, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

  return (
    <View>
      <Text className="text-base font-semibold text-ink">{capitalize(format(today, "LLLL, yyyy", { locale }))}</Text>
      <View className="mt-2 flex-row justify-between">
        {days.map((day) => {
          const isToday = isSameDay(day, today);
          return (
            <View key={day.toISOString()} className="items-center">
              <Text className="text-xs text-ink/70 mb-1">{capitalize(format(day, "EEE", { locale })).slice(0, 3)}</Text>
              <View
                style={{
                  width: DAY_SIZE,
                  height: DAY_SIZE,
                  borderRadius: DAY_SIZE / 2,
                  borderWidth: 1.5,
                  borderColor: colors.ink,
                  backgroundColor: isToday ? colors.amarillo : "transparent",
                }}
                className="items-center justify-center"
              >
                <Text className={`text-sm text-ink ${isToday ? "font-bold" : ""}`}>{format(day, "d")}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
