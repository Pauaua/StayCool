import React from "react";
import { ActivityIndicator, Image, SafeAreaView, ScrollView, Text } from "react-native";
import { format } from "date-fns";
import { useHairstyleDetail } from "@/features/pelo/hooks/usePelo";
import { useT, type TranslationKey } from "@/lib/i18n";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { PeloStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<PeloStackParamList, "HairstyleDetail">;

const STYLE_TYPE_KEYS: Record<string, TranslationKey> = {
  coleta: "pelo.style.coleta",
  suelto: "pelo.style.suelto",
  trenzas: "pelo.style.trenzas",
  otro: "pelo.style.otro",
};

export function HairstyleDetailScreen({ route }: Props) {
  const { hairstyle, photoUrl, isLoading } = useHairstyleDetail(route.params.hairstyleId);
  const { t } = useT();

  if (isLoading || !hairstyle) {
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
          {format(new Date(`${hairstyle.style_date}T00:00:00`), "dd MMMM yyyy")}
        </Text>

        {hairstyle.photo_path ? (
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

        <Text className="text-base text-surface-dark dark:text-white mt-4">{hairstyle.hairstyle}</Text>

        <Text className="text-sm text-gray-500 mt-3">
          {t("pelo.typeLabel", {
            value: hairstyle.style_type ? t(STYLE_TYPE_KEYS[hairstyle.style_type]) : t("common.dash"),
          })}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          {t("pelo.specialOccasionLabel", {
            value: hairstyle.is_special_occasion
              ? hairstyle.occasion_details || t("common.yesNoDetail")
              : t("common.no"),
          })}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
