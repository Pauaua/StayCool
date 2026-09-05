import React, { useState } from "react";
import { FlatList, SafeAreaView, Text, View } from "react-native";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { useDetailedTastes, useQuickTastes } from "@/features/gustos/hooks/useGustos";
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

export function GustosHomeScreen({ navigation }: Props) {
  const [tab, setTab] = useState<"rapido" | "detallado">("rapido");
  const quick = useQuickTastes();
  const detailed = useDetailedTastes();

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark px-5 pt-4">
      <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">Gustos</Text>

      <View className="flex-row mb-4">
        <View className="flex-1 mr-2">
          <Button label="Registro rápido" onPress={() => navigation.navigate("GustoRapido")} />
        </View>
        <View className="flex-1">
          <Button
            label="Música / series / libros"
            variant="secondary"
            onPress={() => navigation.navigate("GustoDetallado")}
          />
        </View>
      </View>

      <View className="flex-row mb-3">
        <Chip label="Rápidos" selected={tab === "rapido"} onPress={() => setTab("rapido")} />
        <Chip label="Detallados" selected={tab === "detallado"} onPress={() => setTab("detallado")} />
      </View>

      {tab === "rapido" ? (
        <FlatList
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
                <Text className="text-xs text-gray-400 capitalize">{item.category}</Text>
              </View>
              {item.genre ? <Text className="text-gray-500 text-sm">Género: {item.genre}</Text> : null}
              {item.details.favoriteBands ? (
                <Text className="text-gray-500 text-sm">Bandas: {item.details.favoriteBands}</Text>
              ) : null}
              {item.details.author ? (
                <Text className="text-gray-500 text-sm">Autor: {item.details.author}</Text>
              ) : null}
              {item.details.director ? (
                <Text className="text-gray-500 text-sm">Director: {item.details.director}</Text>
              ) : null}
            </Card>
          )}
        />
      )}
    </SafeAreaView>
  );
}
