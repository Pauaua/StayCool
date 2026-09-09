import React from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { PremiumGate } from "@/features/premium/components/PremiumGate";
import { useT, type TranslationKey } from "@/lib/i18n";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { EstadisticasStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<EstadisticasStackParamList, "EstadisticasHome">;

const SECTIONS: {
  key: keyof EstadisticasStackParamList;
  labelKey: TranslationKey;
  emoji: string;
  descKey: TranslationKey;
}[] = [
  { key: "EstadisticasHoy", labelKey: "estadisticas.today", emoji: "📅", descKey: "estadisticas.todayDesc" },
  { key: "EstadisticasSemanal", labelKey: "estadisticas.weekly", emoji: "🗓️", descKey: "estadisticas.weeklyDesc" },
  { key: "EstadisticasAnual", labelKey: "estadisticas.yearly", emoji: "📆", descKey: "estadisticas.yearlyDesc" },
];

export function EstadisticasHomeScreen({ navigation }: Props) {
  const { t } = useT();
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark px-5 pt-4">
      <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">
        {t("estadisticas.title")}
      </Text>

      <PremiumGate minTier="full">
        <View>
          {SECTIONS.map((section) => (
            <Pressable key={section.key} onPress={() => navigation.navigate(section.key as never)}>
              <Card className="mb-3 flex-row items-center">
                <Text style={{ fontSize: 28, marginRight: 12 }}>{section.emoji}</Text>
                <View>
                  <Text className="text-lg font-semibold text-surface-dark dark:text-white">
                    {t(section.labelKey)}
                  </Text>
                  <Text className="text-xs text-gray-400">{t(section.descKey)}</Text>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      </PremiumGate>
    </SafeAreaView>
  );
}
