import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  useCreateHygieneItem,
  useDeactivateHygieneItem,
  useDeleteHygieneDay,
  useHygieneHistory,
  useHygieneItems,
  useHygieneLogDetails,
  useToggleHygieneLog,
  useTodayHygieneLogs,
} from "@/features/higiene/hooks/useHygiene";
import { HygieneChecklistItem } from "@/features/higiene/components/HygieneChecklistItem";
import { AddHygieneItemPicker } from "@/features/higiene/components/AddHygieneItemPicker";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useT } from "@/lib/i18n";
import type { HygieneItem } from "@/features/higiene/types";

function DayDetailModal({
  date,
  activeItems,
  onClose,
}: {
  date: string | null;
  activeItems: HygieneItem[];
  onClose: () => void;
}) {
  const { data: logs, isLoading } = useHygieneLogDetails(date);
  const deleteDay = useDeleteHygieneDay();
  const { t, tg } = useT();

  // Combina el checklist activo (para que aparezcan también los ítems que
  // ese día no se llegaron a tocar, marcados como ❌) con cualquier ítem que
  // haya sido eliminado después pero que sí tenga registro ese día.
  const completedByItemId = new Map((logs ?? []).map((l) => [l.hygiene_item_id, l.completed]));
  // No mostramos como "pendiente" un ítem que en esa fecha todavía ni
  // existía (lo agregaste después) — solo entran los que ya estaban creados
  // ese día o antes.
  const itemsThatExistedThatDay = date
    ? activeItems.filter((item) => item.created_at.slice(0, 10) <= date)
    : activeItems;
  const rows = [
    ...itemsThatExistedThatDay.map((item) => ({
      key: item.id,
      label: item.label,
      icon: item.icon,
      completed: completedByItemId.get(item.id) ?? false,
    })),
    ...(logs ?? [])
      .filter((l) => !itemsThatExistedThatDay.some((item) => item.id === l.hygiene_item_id))
      .map((l) => ({
        key: l.id,
        label: l.hygiene_items?.label ?? t("higiene.deletedItem"),
        icon: l.hygiene_items?.icon ?? null,
        completed: l.completed,
      })),
  ];
  const allDone = rows.length > 0 && rows.every((r) => r.completed);

  function handleDelete() {
    if (!date) return;
    Alert.alert(
      t("higiene.deleteRecordTitle"),
      tg("higiene.deleteRecordMessage", { date }),
      [
        { text: t("higiene.cancel"), style: "cancel" },
        {
          text: t("higiene.delete"),
          style: "destructive",
          onPress: () => {
            deleteDay.mutate(date, { onSuccess: onClose });
          },
        },
      ]
    );
  }

  return (
    <Modal visible={date !== null} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <Card className="w-full">
          <Text className="text-lg font-bold text-surface-dark dark:text-white mb-3">{date}</Text>
          {isLoading ? (
            <ActivityIndicator color="#002054" />
          ) : rows.length > 0 ? (
            rows.map((row) => (
              <View key={row.key} className="flex-row items-center justify-between mb-2">
                <Text className="text-surface-dark dark:text-white">
                  {row.icon ? `${row.icon} ` : ""}
                  {row.label}
                </Text>
                <Text>{row.completed ? "✅" : "❌"}</Text>
              </View>
            ))
          ) : (
            <Text className="text-sm text-gray-400 mb-2">{t("higiene.noItems")}</Text>
          )}
          {rows.length > 0 ? (
            <Text
              className={`text-sm font-semibold mt-1 mb-2 ${
                allDone ? "text-accent-teal" : "text-accent-amber"
              }`}
            >
              {allDone ? t("higiene.allDone") : t("higiene.pendingItems")}
            </Text>
          ) : null}
          {logs && logs.length > 0 ? (
            <Pressable onPress={handleDelete} className="mt-1 mb-2">
              <Text className="text-xs text-accent-coral">{t("higiene.deleteLogForDay")}</Text>
            </Pressable>
          ) : null}
          <View className="mt-2">
            <Button label={t("higiene.close")} variant="ghost" onPress={onClose} />
          </View>
        </Card>
      </View>
    </Modal>
  );
}

export function HigieneHomeScreen() {
  const { data: items = [], isLoading: itemsLoading } = useHygieneItems();
  const { data: logs = [] } = useTodayHygieneLogs();
  const toggleLog = useToggleHygieneLog();
  const createItem = useCreateHygieneItem();
  const deactivateItem = useDeactivateHygieneItem();
  const history = useHygieneHistory();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { t } = useT();

  const completedIds = new Set(logs.filter((l) => l.completed).map((l) => l.hygiene_item_id));
  const todayIso = new Date().toISOString().slice(0, 10);
  // El historial guarda solo los ítems que se llegaron a tocar ese día, así
  // que su "total" queda desactualizado apenas agregás un ítem nuevo al
  // checklist y todavía no lo tocaste hoy. Para el día de hoy usamos el
  // total de ítems activos en vivo en vez del conteo histórico.
  const historyItems = (history.data?.pages.flatMap((p) => p.items) ?? []).map((h) =>
    h.log_date === todayIso
      ? { ...h, totalItems: items.length, completedItems: completedIds.size }
      : h
  );
  const activeLabels = new Set(items.map((i) => i.label));

  // Solo mostramos el recordatorio si ya hay algo de historial — si nunca
  // usó el checklist, no tiene sentido "regañarla" por el primer día.
  const yesterdayIso = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const yesterdayEntry = historyItems.find((h) => h.log_date === yesterdayIso);
  const missedYesterday =
    historyItems.length > 0 &&
    (!yesterdayEntry || yesterdayEntry.completedItems < yesterdayEntry.totalItems);

  async function handleAddToday() {
    await history.refetch();
    Alert.alert(t("higiene.addedTitle"), t("higiene.addedMessage"));
  }

  async function handleUpdateToday() {
    await history.refetch();
    Alert.alert(
      t("higiene.updatedTitle"),
      t("higiene.updatedMessage", { done: String(completedIds.size), total: String(items.length) })
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark px-5 pt-8">
      <View className="flex-row items-center mb-4">
        <Image
          source={require("../../../../assets/images/higuiene.png")}
          style={{ width: 56, height: 56, marginRight: 8 }}
          resizeMode="contain"
        />
        <Text className="text-xl font-bold text-surface-dark dark:text-white">{t("higiene.title")}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {missedYesterday ? (
          <Card className="mb-4 bg-accent-coral/10 border border-accent-coral">
            <Text className="text-accent-coral font-semibold">{t("higiene.missedYesterday")}</Text>
          </Card>
        ) : null}

        <View className="mb-3">
          <AddHygieneItemPicker
            excludeLabels={activeLabels}
            onAdd={(preset) => createItem.mutate({ label: preset.label, icon: preset.icon })}
            loading={createItem.isPending}
          />
        </View>

        {itemsLoading ? (
          <Text className="text-gray-400">{t("higiene.loadingChecklist")}</Text>
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

        <View className="flex-row gap-2 mt-3 mb-6">
          <View className="flex-1">
            <Button
              label={t("higiene.addToday")}
              size="sm"
              onPress={handleAddToday}
              loading={history.isRefetching}
            />
          </View>
          <View className="flex-1">
            <Button
              label={t("higiene.updateToday")}
              variant="secondary"
              size="sm"
              onPress={handleUpdateToday}
              loading={history.isRefetching}
            />
          </View>
        </View>

        <Text className="text-base font-semibold text-surface-dark dark:text-white mb-2 mt-4">
          {t("higiene.generalHistory")}
        </Text>
        {historyItems.map((item) => (
          <Pressable key={item.log_date} onPress={() => setSelectedDate(item.log_date)}>
            <Card className="mb-1.5 py-2.5">
              <View className="flex-row justify-between">
                <Text className="text-sm text-surface-dark dark:text-white">{item.log_date}</Text>
                <Text className="text-sm text-brand-500 font-semibold">
                  {item.completedItems}/{item.totalItems}
                </Text>
              </View>
            </Card>
          </Pressable>
        ))}
        {history.hasNextPage ? (
          <Button label={t("higiene.loadMore")} variant="ghost" onPress={() => history.fetchNextPage()} />
        ) : null}
      </ScrollView>

      <DayDetailModal date={selectedDate} activeItems={items} onClose={() => setSelectedDate(null)} />
    </SafeAreaView>
  );
}
