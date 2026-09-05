import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";

// Catálogo cerrado de ítems que se pueden sumar al checklist de Higiene.
// A propósito no es texto libre: dejar agregar "cualquier cosa" desvirtúa el
// checklist (dejaría de ser específicamente de higiene). Los 4 items
// sembrados por defecto (Ducha, Cepillado + hilo dental, Enjuague bucal,
// Desodorante) y "Lavado de pelo" no están acá porque ya vienen activos
// para todo usuario nuevo.
export const HYGIENE_PRESETS: { label: string; icon: string }[] = [
  { label: "Hilo dental", icon: "🧵" },
  { label: "Enjuague bucal", icon: "🧴" },
  { label: "Aplicación de crema", icon: "🧴" },
  { label: "Hidratante corporal", icon: "🧴" },
  { label: "Protector solar", icon: "☀️" },
  { label: "Exfoliación facial", icon: "✨" },
  { label: "Corte de uñas", icon: "💅" },
  { label: "Depilación", icon: "🪒" },
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
  const available = HYGIENE_PRESETS.filter((p) => !excludeLabels.has(p.label));

  if (!open) {
    return <Button label="+ Agregar ítem" variant="ghost" onPress={() => setOpen(true)} />;
  }

  return (
    <View>
      <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-2">
        Elegí qué agregar
      </Text>
      {available.length === 0 ? (
        <Text className="text-gray-400 mb-2">Ya agregaste todos los ítems disponibles.</Text>
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
              className="flex-row items-center bg-white dark:bg-surface-cardDark border border-gray-200 dark:border-gray-700 rounded-full px-3 py-2"
            >
              <Text className="mr-1.5">{preset.icon}</Text>
              <Text className="text-sm text-surface-dark dark:text-white">{preset.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
      <Button label="Cancelar" variant="ghost" onPress={() => setOpen(false)} />
    </View>
  );
}
