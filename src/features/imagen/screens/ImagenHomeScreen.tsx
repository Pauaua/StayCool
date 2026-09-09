import React from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { useT, type TranslationKey } from "@/lib/i18n";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ImagenStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<ImagenStackParamList, "ImagenHome">;

const SECTIONS: {
  key: keyof ImagenStackParamList;
  labelKey: TranslationKey;
  emoji: string;
  descKey: TranslationKey;
}[] = [
  { key: "CaraSection", labelKey: "imagen.cara", emoji: "💄", descKey: "imagen.caraDesc" },
  { key: "VestuarioHome", labelKey: "imagen.vestuario", emoji: "👗", descKey: "imagen.vestuarioDesc" },
  { key: "ZapatosHome", labelKey: "imagen.zapatos", emoji: "👠", descKey: "imagen.zapatosDesc" },
];

export function ImagenHomeScreen({ navigation }: Props) {
  const { t } = useT();
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark px-5 pt-4">
      <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">{t("imagen.title")}</Text>

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
    </SafeAreaView>
  );
}
