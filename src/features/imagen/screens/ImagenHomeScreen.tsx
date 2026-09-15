import React from "react";
import { Image, Pressable, SafeAreaView, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { useT, type TranslationKey } from "@/lib/i18n";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ImagenStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<ImagenStackParamList, "ImagenHome">;

const SECTIONS: {
  key: keyof ImagenStackParamList;
  labelKey: TranslationKey;
  emoji?: string;
  icon?: number;
  descKey: TranslationKey;
}[] = [
  {
    key: "CaraSection",
    labelKey: "imagen.cara",
    icon: require("../../../../assets/images/makeup.png"),
    descKey: "imagen.caraDesc",
  },
  {
    key: "VestuarioHome",
    labelKey: "imagen.vestuario",
    icon: require("../../../../assets/images/vestidosss.png"),
    descKey: "imagen.vestuarioDesc",
  },
  {
    key: "ZapatosHome",
    labelKey: "imagen.zapatos",
    icon: require("../../../../assets/images/zapatitos.png"),
    descKey: "imagen.zapatosDesc",
  },
];

export function ImagenHomeScreen({ navigation }: Props) {
  const { t } = useT();
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark px-5 pt-4">
      <View className="flex-row items-center mb-4">
        <Image
          source={require("../../../../assets/images/aufit.png")}
          style={{ width: 56, height: 56, marginRight: 8 }}
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold text-surface-dark dark:text-white">{t("imagen.title")}</Text>
      </View>

      <View>
        {SECTIONS.map((section) => (
          <Pressable key={section.key} onPress={() => navigation.navigate(section.key as never)}>
            <Card className="mb-3 flex-row items-center">
              {section.icon ? (
                <Image
                  source={section.icon}
                  style={{ width: 28, height: 28, marginRight: 12 }}
                  resizeMode="contain"
                />
              ) : (
                <Text style={{ fontSize: 28, marginRight: 12 }}>{section.emoji}</Text>
              )}
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
