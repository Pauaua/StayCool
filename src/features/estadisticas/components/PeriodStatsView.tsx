import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { useT } from "@/lib/i18n";
import type { PeriodStats } from "@/features/estadisticas/services/estadisticasService";

export function PeriodStatsView({ data, isLoading }: { data: PeriodStats | undefined; isLoading: boolean }) {
  const { t } = useT();

  if (isLoading || !data) {
    return (
      <View className="items-center py-16">
        <ActivityIndicator color="#002054" size="large" />
      </View>
    );
  }

  if (!data.hasData) {
    return (
      <Card className="items-center py-8">
        <Text className="text-gray-500 text-center">{t("estadisticas.noData")}</Text>
      </Card>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="gap-3">
        <Card>
          <Text className="text-surface-dark dark:text-white">
            <Text style={{ fontSize: 12 }}>🌿 </Text>
            <Text className="font-bold">{t("estadisticas.section.bienestar")}</Text>
            {t("estadisticas.period.bienestar", {
              meals: String(data.mealsCount),
              mealsWord: t(data.mealsCount === 1 ? "estadisticas.word.vez" : "estadisticas.word.veces"),
              exercise: String(data.exerciseCount),
              exerciseWord: t(data.exerciseCount === 1 ? "estadisticas.word.vez" : "estadisticas.word.veces"),
            })}
          </Text>
        </Card>

        <Card>
          <Text className="text-surface-dark dark:text-white">
            <Text style={{ fontSize: 12 }}>🧼 </Text>
            <Text className="font-bold">{t("estadisticas.section.higiene")}</Text>
            {t("estadisticas.period.higiene", { percent: String(data.hygieneCompletionPercent) })}
          </Text>
        </Card>

        <Card>
          <Text className="text-surface-dark dark:text-white">
            <Text style={{ fontSize: 12 }}>💇‍♀️ </Text>
            <Text className="font-bold">{t("estadisticas.section.pelo")}</Text>
            {t("estadisticas.period.pelo", {
              washes: String(data.hairWashCount),
              washWord: t(data.hairWashCount === 1 ? "estadisticas.word.vez" : "estadisticas.word.veces"),
              styles: String(data.hairstyleCount),
              styleWord: t(data.hairstyleCount === 1 ? "estadisticas.word.peinado" : "estadisticas.word.peinados"),
            })}
          </Text>
        </Card>

        <Card>
          <Text className="text-surface-dark dark:text-white">
            <Text style={{ fontSize: 12 }}>💄 </Text>
            <Text className="font-bold">{t("estadisticas.section.cara")}</Text>
            {t("estadisticas.period.cara", {
              n: String(data.makeupDaysCount),
              word: t(data.makeupDaysCount === 1 ? "estadisticas.word.dia" : "estadisticas.word.dias"),
            })}
          </Text>
        </Card>

        <Card>
          <Text className="text-surface-dark dark:text-white">
            <Text style={{ fontSize: 12 }}>👗 </Text>
            <Text className="font-bold">{t("estadisticas.section.imagen")}</Text>
            {t("estadisticas.period.imagen", {
              outfits: String(data.outfitsCount),
              outfitWord: t(data.outfitsCount === 1 ? "estadisticas.word.outfit" : "estadisticas.word.outfits"),
              shoes: String(data.shoesCount),
              shoeWord: t(
                data.shoesCount === 1 ? "estadisticas.word.parZapatos" : "estadisticas.word.paresZapatos"
              ),
            })}
          </Text>
        </Card>

        <Card>
          <Text className="text-surface-dark dark:text-white">
            <Text style={{ fontSize: 12 }}>🎉 </Text>
            <Text className="font-bold">{t("estadisticas.section.social")}</Text>
            {t("estadisticas.period.social", {
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
            <Text style={{ fontSize: 12 }}>💸 </Text>
            <Text className="font-bold">{t("estadisticas.section.gastos")}</Text>
            {t("estadisticas.period.gastos", { amount: data.expenseTotal.toLocaleString("es-CL") })}
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
}
