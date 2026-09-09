import React from "react";
import { ActivityIndicator, Image, SafeAreaView, ScrollView, Text } from "react-native";
import { format } from "date-fns";
import { useOutfitDetail } from "@/features/imagen/hooks/useImagen";
import { useT, type TranslationKey } from "@/lib/i18n";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ImagenStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<ImagenStackParamList, "OutfitDetail">;

const WEATHER_KEYS: Record<string, TranslationKey> = {
  frio: "weather.frio",
  calor: "weather.calor",
  intermedio: "weather.intermedio",
};

const CLOTHING_KEYS: Record<string, TranslationKey> = {
  vestido: "clothing.vestido",
  pantalon: "clothing.pantalon",
  falda: "clothing.falda",
  otro: "clothing.otro",
};

export function OutfitDetailScreen({ route }: Props) {
  const { outfit, photoUrl, isLoading } = useOutfitDetail(route.params.outfitId);
  const { t } = useT();

  if (isLoading || !outfit) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark items-center justify-center">
        <ActivityIndicator color="#b825f2" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark px-5 pt-4">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-1">
          {format(new Date(`${outfit.outfit_date}T00:00:00`), "dd MMMM yyyy")}
        </Text>

        {outfit.photo_path ? (
          photoUrl ? (
            <Image
              source={{ uri: photoUrl }}
              className="w-full rounded-card mt-4"
              style={{ aspectRatio: 3 / 4 }}
              resizeMode="cover"
            />
          ) : (
            <ActivityIndicator className="mt-6" color="#b825f2" />
          )
        ) : null}

        <Text className="text-base text-surface-dark dark:text-white mt-4">
          {outfit.description || t("common.noDescription")}
        </Text>

        <Text className="text-sm text-gray-500 mt-3">
          {t("vestuario.weatherLabel", {
            value: outfit.weather ? t(WEATHER_KEYS[outfit.weather]) : t("common.dash"),
          })}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          {t("vestuario.clothingTypeLabel", {
            value: outfit.clothing_type ? t(CLOTHING_KEYS[outfit.clothing_type]) : t("common.dash"),
          })}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          {t("vestuario.mainColorsLabel", { value: outfit.main_colors || t("common.dash") })}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          {t("vestuario.accessoriesLabel", {
            value: outfit.used_accessories
              ? outfit.accessories_description || t("common.yesNoDetail")
              : t("common.no"),
          })}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          {t("vestuario.notesLabel", { value: outfit.notes || t("common.dash") })}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
