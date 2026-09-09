import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { useT, type TranslationKey } from "@/lib/i18n";

// Catálogo cerrado de ítems que se pueden sumar al checklist de Higiene.
// A propósito no es texto libre: dejar agregar "cualquier cosa" desvirtúa el
// checklist (dejaría de ser específicamente de higiene). Los 4 items
// sembrados por defecto (Ducha, Cepillado, Enjuague bucal,
// Desodorante) y "Lavado de pelo" no están acá porque ya vienen activos
// para todo usuario nuevo.
//
// `label` es el valor canónico que se persiste en Supabase (no cambia con el
// idioma, para no romper comparaciones/dedup contra ítems ya guardados);
// `labelKey` es solo para mostrar el texto en el idioma elegido.
export const HYGIENE_PRESETS: { label: string; labelKey: TranslationKey; icon: string }[] = [
  { label: "Hilo dental", labelKey: "higiene.preset.hiloDental", icon: "🧵" },
  { label: "Enjuague bucal", labelKey: "higiene.preset.enjuagueBucal", icon: "🧴" },
  { label: "Aplicación de crema", labelKey: "higiene.preset.aplicacionCrema", icon: "🧴" },
  { label: "Protector solar", labelKey: "higiene.preset.protectorSolar", icon: "☀️" },
  { label: "Exfoliación facial", labelKey: "higiene.preset.exfoliacionFacial", icon: "✨" },
  { label: "Corte de uñas", labelKey: "higiene.preset.corteUnas", icon: "💅" },
  { label: "Depilación", labelKey: "higiene.preset.depilacion", icon: "🪒" },
  { label: "Skincare", labelKey: "higiene.preset.skincare", icon: "🧖‍♀️" },
  { label: "Exfoliación", labelKey: "higiene.preset.exfoliacion", icon: "🧽" },
  { label: "Masaje capilar", labelKey: "higiene.preset.masajeCapilar", icon: "💆‍♀️" },
];

export function AddHygieneItemPicker({
  excludeLabels,
  onAdd,
  loading,
}: {
  excludeLabels: Set<string>;
  onAdd: (preset: { label: string; icon: string }) => void;
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { t } = useT();
  const available = HYGIENE_PRESETS.filter((p) => !excludeLabels.has(p.label));

  if (!open) {
    return (
      <Pressable
        onPress={() => setOpen(true)}
        className="self-start rounded-full border border-brand-500 px-3 py-1.5"
      >
        <Text className="text-xs font-semibold text-brand-500">{t("higiene.addItem")}</Text>
      </Pressable>
    );
  }

  return (
    <View>
      <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-2">
        {t("higiene.pickWhatToAdd")}
      </Text>
      {available.length === 0 ? (
        <Text className="text-gray-400 mb-2">{t("higiene.allItemsAdded")}</Text>
      ) : (
        <View className="flex-row flex-wrap gap-2 mb-2">
          {available.map((preset) => (
            <Pressable
              key={preset.label}
              disabled={loading}
              onPress={() => {
                onAdd(preset);
                setOpen(false);
              }}
              className="flex-row items-center bg-white dark:bg-surface-cardDark border border-gray-200 dark:border-gray-700 rounded-full px-2.5 py-1.5"
            >
              <Text className="mr-1 text-xs">{preset.icon}</Text>
              <Text className="text-xs text-surface-dark dark:text-white">{t(preset.labelKey)}</Text>
            </Pressable>
          ))}
        </View>
      )}
      <Button label={t("higiene.cancel")} variant="ghost" onPress={() => setOpen(false)} />
    </View>
  );
}
