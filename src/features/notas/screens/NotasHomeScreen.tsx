import React, { useState } from "react";
import { FlatList, SafeAreaView, Text, View } from "react-native";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { useDetailedNotes, useQuickNotes } from "@/features/notas/hooks/useNotas";
import { useT } from "@/lib/i18n";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { NotasStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<NotasStackParamList, "NotasHome">;

export function NotasHomeScreen({ navigation }: Props) {
  const [tab, setTab] = useState<"rapida" | "detallada">("rapida");
  const quick = useQuickNotes();
  const detailed = useDetailedNotes();
  const { t } = useT();

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark px-5 pt-8">
      <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">{t("notas.title")}</Text>

      <View className="mb-4">
        <View className="mb-2">
          <Button label={t("notas.quickIdea")} onPress={() => navigation.navigate("NotaRapida")} />
        </View>
        <Button label={t("notas.fullIdea")} variant="secondary" onPress={() => navigation.navigate("NotaDetallada")} />
      </View>

      <Text className="text-lg font-semibold text-surface-dark dark:text-white mb-2">
        {t("notas.record")}
      </Text>

      <View className="flex-row mb-3">
        <Chip label={t("notas.quickTab")} selected={tab === "rapida"} onPress={() => setTab("rapida")} />
        <Chip label={t("notas.fullTab")} selected={tab === "detallada"} onPress={() => setTab("detallada")} />
      </View>

      {tab === "rapida" ? (
        <FlatList
          contentContainerStyle={{ paddingBottom: 40 }}
          data={quick.data?.pages.flatMap((p) => p.items) ?? []}
          keyExtractor={(item) => item.id}
          onEndReached={() => quick.hasNextPage && quick.fetchNextPage()}
          onEndReachedThreshold={0.4}
          renderItem={({ item }) => (
            <Card className="mb-2">
              <Text className="text-surface-dark dark:text-white font-semibold">{item.name}</Text>
              {item.description ? <Text className="text-gray-500 text-sm">{item.description}</Text> : null}
              {item.feeling ? (
                <Text className="text-brand-500 text-sm">{t("notas.feelingLabel", { value: item.feeling })}</Text>
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
              <Text className="text-surface-dark dark:text-white font-semibold">{item.name}</Text>
              <Text className="text-gray-500 text-sm">{item.idea}</Text>
              {item.location ? <Text className="text-xs text-gray-400">📍 {item.location}</Text> : null}
              {item.feelings ? (
                <Text className="text-brand-500 text-sm">{t("notas.feelingsLabel", { value: item.feelings })}</Text>
              ) : null}
              {item.thoughts ? (
                <Text className="text-gray-500 text-sm">{t("notas.thoughtsLabel", { value: item.thoughts })}</Text>
              ) : null}
            </Card>
          )}
        />
      )}
    </SafeAreaView>
  );
}
