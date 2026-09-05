import React from "react";
import { Pressable, Text } from "react-native";

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: string;
}

export function Chip({ label, selected, onPress, icon }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-4 py-2 rounded-full mr-2 mb-2 border ${
        selected
          ? "bg-brand-500 border-brand-500"
          : "bg-transparent border-gray-300 dark:border-gray-600"
      }`}
    >
      <Text className={selected ? "text-white font-semibold" : "text-surface-dark dark:text-white"}>
        {icon ? `${icon} ` : ""}
        {label}
      </Text>
    </Pressable>
  );
}
