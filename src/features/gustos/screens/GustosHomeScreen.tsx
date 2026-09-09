import React, { useState } from "react";
import { FlatList, SafeAreaView, Text, View } from "react-native";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { useDetailedTastes, useQuickTastes } from "@/features/gustos/hooks/useGustos";
import { useT, type TranslationKey } from "@/lib/i18n";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { GustosStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<GustosStackParamList, "GustosHome">;

const CATEGORY_EMOJI: Record<string, string> = {
  musica: "🎵",
  serie: "📺",
  pelicula: "🎬",
  libro: "📚",
  otro: "✨",
};

const CATEGORY_KEY: Record<string, TranslationKey> = {
  musica: "gustos.category.musica",
  serie: "gustos.category.serie",
  pelicula: "gustos.category.pelicula",
  libro: "gustos.category.libro",
  otro: "gustos.category.otro",
};

export function GustosHomeScreen({ navigation }: Props) {
  const [tab, setTab] = useState<"rapido" | "detallado">("rapido");
  const quick = useQuickTastes();
  const detailed = useDetailedTastes();
  const { t } = useT();

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark px-5 pt-8">
      <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">{t("gustos.title")}</Text>



      <View className="mb-4">
        <View className="mb-2">
          <Button label={t("gustos.quickRecord")} onPress={() => navigation.navigate("GustoRapido")} />
        </View>
        <Button
          label={t("gustos.musicSeriesBooks")}
          variant="secondary"
          onPress={() => navigation.navigate("GustoDetallado")}
        />
      </View>
      <Text className="text-lg font-semibold text-surface-dark dark:text-white mb-2">
        {t("gustos.record")}
      </Text>
      <View className="flex-row mb-3">
        <Chip label={t("gustos.quickTab")} selected={tab === "rapido"} onPress={() => setTab("rapido")} />
        <Chip label={t("gustos.detailedTab")} selected={tab === "detallado"} onPress={() => setTab("detallado")} />
      </View>

      {tab === "rapido" ? (
        <FlatList
          contentContainerStyle={{ paddingBottom: 40 }}
          data={quick.data?.pages.flatMap((p) => p.items) ?? []}
          keyExtractor={(item) => item.id}
          onEndReached={() => quick.hasNextPage && quick.fetchNextPage()}
          onEndReachedThreshold={0.4}
          renderItem={({ item }) => (
            <Card className="mb-2">
              <Text className="text-surface-dark dark:text-white font-semibold">{item.name}</Text>
              {item.description ? (
                <Text className="text-gray-500 text-sm">{item.description}</Text>
              ) : null}
              <Text className="text-xs text-gray-400">{format(new Date(item.logged_at), "dd MMM yyyy")}</Text>
            </Card>
          )}
        />
      ) : (
        <FlatList
          contentContainerStyle={{ paddingBottom: 40 }}
          data={detailed.data?.pages.flatMap((p) => p.items) ?? []}
          keyExtractor={(item) => item.id}
          onEndReached={() => detailed.hasNextPage && detailed.fetchNextPage()}
          onEndReachedThreshold={0.4}
          renderItem={({ item }) => (
            <Card className="mb-2">
              <View className="flex-row justify-between">
                <Text className="text-surface-dark dark:text-white font-semibold">
                  {CATEGORY_EMOJI[item.category] ?? "✨"} {item.name}
                </Text>
                <Text className="text-xs text-gray-400 capitalize">
                  {t(CATEGORY_KEY[item.category] ?? "gustos.category.otro")}
                </Text>
              </View>
              {item.genre ? (
                <Text className="text-gray-500 text-sm">{t("gustos.genreLabel", { value: item.genre })}</Text>
              ) : null}
              {item.details.favoriteBands ? (
                <Text className="text-gray-500 text-sm">
                  {t("gustos.bandsLabel", { value: item.details.favoriteBands })}
                </Text>
              ) : null}
              {item.details.author ? (
                <Text className="text-gray-500 text-sm">
                  {t("gustos.authorLabel", { value: item.details.author })}
                </Text>
              ) : null}
              {item.details.director ? (
                <Text className="text-gray-500 text-sm">
                  {t("gustos.directorLabel", { value: item.details.director })}
                </Text>
              ) : null}
            </Card>
          )}
        />
      )}
    </SafeAreaView>
  );
}
