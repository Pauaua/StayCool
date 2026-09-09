import React from "react";
import { ActivityIndicator, Image, SafeAreaView, ScrollView, Text } from "react-native";
import { format } from "date-fns";
import { useShoeDetail } from "@/features/imagen/hooks/useImagen";
import { useT, type TranslationKey } from "@/lib/i18n";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ImagenStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<ImagenStackParamList, "ShoeDetail">;

const WEATHER_KEYS: Record<string, TranslationKey> = {
  frio: "weather.frio",
  calor: "weather.calor",
  intermedio: "weather.intermedio",
};

const SHOE_TYPE_KEYS: Record<string, TranslationKey> = {
  sandalia: "shoeType.sandalia",
  zapatilla: "shoeType.zapatilla",
  botines: "shoeType.botines",
  bototos: "shoeType.bototos",
  trekking: "shoeType.trekking",
  otro: "shoeType.otro",
};

const CONDITION_KEYS: Record<string, TranslationKey> = {
  bueno: "shoeCondition.bueno",
  pasable: "shoeCondition.pasable",
  necesita_cambio: "shoeCondition.necesita_cambio",
};

export function ShoeDetailScreen({ route }: Props) {
  const { shoe, photoUrl, isLoading } = useShoeDetail(route.params.shoeId);
  const { t } = useT();

  if (isLoading || !shoe) {
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
          {format(new Date(`${shoe.shoe_date}T00:00:00`), "dd MMMM yyyy")}
        </Text>

        {shoe.photo_path ? (
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
          {shoe.description || t("common.noDescription")}
        </Text>

        <Text className="text-sm text-gray-500 mt-3">
          {t("vestuario.weatherLabel", { value: shoe.weather ? t(WEATHER_KEYS[shoe.weather]) : t("common.dash") })}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          {t("zapatos.shoeType")}: {shoe.shoe_type ? t(SHOE_TYPE_KEYS[shoe.shoe_type]) : t("common.dash")}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          {t("zapatos.colorLabel", { value: shoe.color || t("common.dash") })}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          {t("zapatos.brandLabel", { value: shoe.brand || t("common.dash") })}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          {t("zapatos.conditionLabel", { value: shoe.condition ? t(CONDITION_KEYS[shoe.condition]) : t("common.dash") })}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          {t("vestuario.notesLabel", { value: shoe.notes || t("common.dash") })}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
