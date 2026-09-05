import React from "react";
import { ActivityIndicator, Image, SafeAreaView, ScrollView, Text } from "react-native";
import { format } from "date-fns";
import { useHairstyleDetail } from "@/features/pelo/hooks/usePelo";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { PeloStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<PeloStackParamList, "HairstyleDetail">;

export function HairstyleDetailScreen({ route }: Props) {
  const { hairstyle, photoUrl, isLoading } = useHairstyleDetail(route.params.hairstyleId);

  if (isLoading || !hairstyle) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark items-center justify-center">
        <ActivityIndicator color="#b825f2" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark px-5 pt-4">
      <ScrollView>
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
      </ScrollView>
    </SafeAreaView>
  );
}
