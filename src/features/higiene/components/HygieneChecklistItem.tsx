import React from "react";
import { Pressable, Text, View } from "react-native";
import type { HygieneItem } from "@/features/higiene/types";

export function HygieneChecklistItem({
  item,
  completed,
  onToggle,
  onRemove,
}: {
  item: HygieneItem;
  completed: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between bg-white dark:bg-surface-cardDark rounded-card px-4 py-3.5 mb-2.5">
      <Pressable onPress={onToggle} className="flex-row items-center gap-3 flex-1">
        <Text className="text-xl">{item.icon ?? "🧼"}</Text>
        <Text className="text-base text-surface-dark dark:text-white">{item.label}</Text>
      </Pressable>
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={onToggle}
          className={`w-6 h-6 rounded-full items-center justify-center border-2 ${
            completed ? "bg-brand-500 border-brand-500" : "border-gray-300 dark:border-gray-600"
          }`}
        >
          {completed ? <Text className="text-white text-xs">✓</Text> : null}
        </Pressable>
        <Pressable onPress={onRemove} hitSlop={8}>
          <Text className="text-gray-400">✕</Text>
        </Pressable>
      </View>
    </View>
  );
}
