import React from "react";
import { Image, Pressable, SafeAreaView, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { PremiumGate } from "@/features/premium/components/PremiumGate";
import { useT, type TranslationKey } from "@/lib/i18n";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { EstadisticasStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<EstadisticasStackParamList, "EstadisticasHome">;

const SECTIONS: {
  key: keyof EstadisticasStackParamList;
  labelKey: TranslationKey;
  icon: number;
  descKey: TranslationKey;
}[] = [
  {
    key: "EstadisticasHoy",
    labelKey: "estadisticas.today",
    icon: require("../../../../assets/images/Hoy.png"),
    descKey: "estadisticas.todayDesc",
  },
  {
    key: "EstadisticasSemanal",
    labelKey: "estadisticas.weekly",
    icon: require("../../../../assets/images/semanal.png"),
    descKey: "estadisticas.weeklyDesc",
  },
  {
    key: "EstadisticasAnual",
    labelKey: "estadisticas.yearly",
    icon: require("../../../../assets/images/anual.png"),
    descKey: "estadisticas.yearlyDesc",
  },
];

export function EstadisticasHomeScreen({ navigation }: Props) {
  const { t } = useT();
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark px-5 pt-4">
      <View className="flex-row items-center mb-4">
        <Image
          source={require("../../../../assets/images/estadisticas.png")}
          style={{ width: 56, height: 56, marginRight: 8 }}
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold text-surface-dark dark:text-white">
          {t("estadisticas.title")}
        </Text>
      </View>

      <PremiumGate minTier="full">
        <View>
          {SECTIONS.map((section) => (
            <Pressable key={section.key} onPress={() => navigation.navigate(section.key as never)}>
              <Card className="mb-3 flex-row items-center">
                <Image
                  source={section.icon}
                  style={{ width: 36, height: 36, marginRight: 12 }}
                  resizeMode="contain"
                />
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
