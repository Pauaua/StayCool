import React from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ImagenStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<ImagenStackParamList, "ImagenHome">;

const SECTIONS: { key: keyof ImagenStackParamList; label: string; emoji: string; description: string }[] = [
  { key: "CaraSection", label: "Cara", emoji: "💄", description: "Maquillaje del día" },
  { key: "VestuarioHome", label: "Vestuario", emoji: "👗", description: "Qué usaste hoy" },
  { key: "ZapatosHome", label: "Zapatos", emoji: "👠", description: "Qué te calzaste hoy" },
];

export function ImagenHomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark px-5 pt-4">
      <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">Imagen</Text>

      <View>
        {SECTIONS.map((section) => (
          <Pressable key={section.key} onPress={() => navigation.navigate(section.key as never)}>
            <Card className="mb-3 flex-row items-center">
              <Text style={{ fontSize: 28, marginRight: 12 }}>{section.emoji}</Text>
              <View>
                <Text className="text-lg font-semibold text-surface-dark dark:text-white">
                  {section.label}
                </Text>
                <Text className="text-xs text-gray-400">{section.description}</Text>
              </View>
            </Card>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}
