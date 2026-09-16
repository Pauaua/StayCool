import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import type { HygieneItem } from "@/features/higiene/types";
import { translateHygieneLabel } from "@/features/higiene/labelTranslation";
import { useT } from "@/lib/i18n";

// Los ítems sembrados por defecto (y el preset "Corte de uñas") tienen un
// emoji guardado en Supabase (item.icon); acá los pisamos por íconos propios
// buscando por label canónico, que no cambia con el idioma. Cualquier ítem
// sin match (agregado libre, u otro preset) sigue mostrando su emoji tal cual.
const HYGIENE_ITEM_ICONS: Record<string, number> = {
  Ducha: require("../../../../assets/images/duchatecoxinakla.png"),
  "Enjuague bucal": require("../../../../assets/images/Enjuage bucal.png"),
  Desodorante: require("../../../../assets/images/desodorante.png"),
  Cepillado: require("../../../../assets/images/cepillito.png"),
  "Corte de uñas": require("../../../../assets/images/uñotas.png"),
  "Lavado de pelo": require("../../../../assets/images/pelito lavado.png"),
  "Protector solar": require("../../../../assets/images/solazo.png"),
  "Masaje capilar": require("../../../../assets/images/brillitos.png"),
  Skincare: require("../../../../assets/images/makeup.png"),
  Exfoliación: require("../../../../assets/images/higuiene.png"),
};

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
  const { t } = useT();
  return (
    <View className="flex-row items-center justify-between bg-white dark:bg-surface-cardDark rounded-card px-3 py-2.5 mb-2">
      <Pressable onPress={onToggle} className="flex-row items-center gap-2 flex-1">
        {HYGIENE_ITEM_ICONS[item.label] ? (
          <Image source={HYGIENE_ITEM_ICONS[item.label]} style={{ width: 30, height: 30 }} resizeMode="contain" />
        ) : (
          <Text className="text-base">{item.icon ?? "🧼"}</Text>
        )}
        <Text className="text-sm text-surface-dark dark:text-white">{translateHygieneLabel(t, item.label)}</Text>
      </Pressable>
      <View className="flex-row items-center gap-2.5">
        <Pressable
          onPress={onToggle}
          className={`w-5 h-5 rounded-full items-center justify-center border-2 ${
            completed ? "bg-brand-500 border-brand-500" : "border-gray-300 dark:border-gray-600"
          }`}
        >
          {completed ? <Text className="text-white text-xs">✓</Text> : null}
        </Pressable>
        <Pressable onPress={onRemove} hitSlop={8}>
          <Text className="text-gray-400 text-xs">✕</Text>
        </Pressable>
      </View>
    </View>
  );
}
