import React from "react";
import { Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { useT, type TranslationKey } from "@/lib/i18n";
import type { TodayStats } from "@/features/estadisticas/services/estadisticasService";

const MOOD_KEY: Record<string, TranslationKey> = {
  genial: "bienestar.mood.genial",
  bien: "bienestar.mood.bien",
  neutral: "bienestar.mood.neutral",
  mal: "bienestar.mood.mal",
  agotado: "bienestar.mood.agotado",
};

export function hasAnyDayData(data: TodayStats): boolean {
  return (
    data.mealsCount > 0 ||
    data.exerciseCount > 0 ||
    data.hygieneTotal > 0 ||
    data.hairWashed ||
    data.hairstyleLogged ||
    data.madeUp ||
    data.outfitLogged ||
    data.shoesLogged ||
    data.mood !== null ||
    data.activitiesCount > 0 ||
    data.expenseTotal > 0
  );
}

// Frases del día, reutilizadas tanto por "Hoy" como por el detalle de un
// día elegido en el calendario de la estadística anual.
export function DayStatsView({ data }: { data: TodayStats }) {
  const { t } = useT();

  return (
    <View className="gap-3">
      <Card>
        <Text className="text-surface-dark dark:text-white">
          <Text className="font-bold">{t("estadisticas.section.bienestar")}</Text>
          {t("estadisticas.day.bienestar", {
            meals: String(data.mealsCount),
            mealsWord: t(data.mealsCount === 1 ? "estadisticas.word.vez" : "estadisticas.word.veces"),
            exercise: String(data.exerciseCount),
            exerciseWord: t(data.exerciseCount === 1 ? "estadisticas.word.vez" : "estadisticas.word.veces"),
          })}
        </Text>
      </Card>

      <Card>
        <Text className="text-surface-dark dark:text-white">
          <Text className="font-bold">{t("estadisticas.section.higiene")}</Text>
          {t("estadisticas.day.higiene", {
            showered: t(data.showered ? "estadisticas.day.showered" : "estadisticas.day.notShowered"),
            completed: String(data.hygieneCompleted),
            total: String(data.hygieneTotal),
          })}
        </Text>
      </Card>

      <Card>
        <Text className="text-surface-dark dark:text-white">
          <Text className="font-bold">{t("estadisticas.section.pelo")}</Text>
          {t("estadisticas.day.pelo", {
            washed: t(data.hairWashed ? "estadisticas.day.hairWashed" : "estadisticas.day.hairNotWashed"),
            hairstyle: t(
              data.hairstyleLogged ? "estadisticas.day.hairstyleLogged" : "estadisticas.day.hairstyleNotLogged"
            ),
          })}
        </Text>
      </Card>

      <Card>
        <Text className="text-surface-dark dark:text-white">
          <Text className="font-bold">{t("estadisticas.section.cara")}</Text>
          {t(data.madeUp ? "estadisticas.day.madeUp" : "estadisticas.day.notMadeUp")}
        </Text>
      </Card>

      <Card>
        <Text className="text-surface-dark dark:text-white">
          <Text className="font-bold">{t("estadisticas.section.imagen")}</Text>
          {t("estadisticas.day.imagen", {
            outfit: t(data.outfitLogged ? "estadisticas.day.outfitLogged" : "estadisticas.day.outfitNotLogged"),
            shoes: t(data.shoesLogged ? "estadisticas.day.shoesLogged" : "estadisticas.day.shoesNotLogged"),
          })}
        </Text>
      </Card>

      <Card>
        <Text className="text-surface-dark dark:text-white">
          <Text className="font-bold">{t("estadisticas.section.sentires")}</Text>
          {data.mood
            ? t("estadisticas.day.moodLogged", { mood: t(MOOD_KEY[data.mood] ?? "bienestar.mood.neutral") })
            : t("estadisticas.day.moodNotLogged")}
        </Text>
      </Card>

      <Card>
        <Text className="text-surface-dark dark:text-white">
          <Text className="font-bold">{t("estadisticas.section.social")}</Text>
          {t("estadisticas.day.social", {
            n: String(data.activitiesCount),
            word: t(
              data.activitiesCount === 1
                ? "estadisticas.word.actividadAgendada"
                : "estadisticas.word.actividadesAgendadas"
            ),
          })}
        </Text>
      </Card>

      <Card>
        <Text className="text-surface-dark dark:text-white">
          <Text className="font-bold">{t("estadisticas.section.gastos")}</Text>
          {t("estadisticas.day.gastos", { amount: data.expenseTotal.toLocaleString("es-CL") })}
        </Text>
      </Card>
    </View>
  );
}
