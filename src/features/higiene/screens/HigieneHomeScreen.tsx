import React from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import {
  useCreateHygieneItem,
  useDeactivateHygieneItem,
  useHygieneHistory,
  useHygieneItems,
  useToggleHygieneLog,
  useTodayHygieneLogs,
} from "@/features/higiene/hooks/useHygiene";
import { HygieneChecklistItem } from "@/features/higiene/components/HygieneChecklistItem";
import { AddHygieneItemPicker } from "@/features/higiene/components/AddHygieneItemPicker";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function HigieneHomeScreen() {
  const { data: items = [], isLoading: itemsLoading } = useHygieneItems();
  const { data: logs = [] } = useTodayHygieneLogs();
  const toggleLog = useToggleHygieneLog();
  const createItem = useCreateHygieneItem();
  const deactivateItem = useDeactivateHygieneItem();
  const history = useHygieneHistory();

  const completedIds = new Set(logs.filter((l) => l.completed).map((l) => l.hygiene_item_id));
  const historyItems = history.data?.pages.flatMap((p) => p.items) ?? [];
  const activeLabels = new Set(items.map((i) => i.label));

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark px-5 pt-4">
      <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">
        Higiene de hoy
      </Text>

      <ScrollView>
        {itemsLoading ? (
          <Text className="text-gray-400">Cargando checklist...</Text>
        ) : (
          items.map((item) => (
            <HygieneChecklistItem
              key={item.id}
              item={item}
              completed={completedIds.has(item.id)}
              onToggle={() =>
                toggleLog.mutate({
                  itemId: item.id,
                  completed: !completedIds.has(item.id),
                  isHairWash: item.is_hair_wash,
                })
              }
              onRemove={() => deactivateItem.mutate(item.id)}
            />
          ))
        )}

        <View className="mt-3 mb-6">
          <AddHygieneItemPicker
            excludeLabels={activeLabels}
            onAdd={(preset) => createItem.mutate({ label: preset.label, icon: preset.icon })}
            loading={createItem.isPending}
          />
        </View>

        <Text className="text-lg font-semibold text-surface-dark dark:text-white mb-2 mt-4">
          Historial general
        </Text>
        {historyItems.map((item) => (
          <Card key={item.log_date} className="mb-2">
            <View className="flex-row justify-between">
              <Text className="text-surface-dark dark:text-white">{item.log_date}</Text>
              <Text className="text-brand-500 font-semibold">
                {item.completedItems}/{item.totalItems}
              </Text>
            </View>
          </Card>
        ))}
        {history.hasNextPage ? (
          <Button label="Cargar más" variant="ghost" onPress={() => history.fetchNextPage()} />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
