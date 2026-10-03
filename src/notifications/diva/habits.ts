// Hábitos que cubren los Recordatorios Diva. Cada uno corresponde a un ítem
// del checklist de Cuidado Personal (hygiene_items), identificado por su
// label canónico en español (ver labelTranslation.ts) — "Lavado de pelo" se
// identifica por is_hair_wash. Solo se recuerdan los hábitos que la persona
// tiene activos en su checklist.
//
// frequencyDays es cada cuántos días "debería" registrarse: con 1, el
// recordatorio cae el día siguiente al último registro; con 3, al tercer día.

export type HabitKey =
  | "ducha"
  | "cepillado"
  | "enjuagueBucal"
  | "desodorante"
  | "lavadoPelo"
  | "hiloDental"
  | "aplicacionCrema"
  | "protectorSolar"
  | "skincare"
  | "exfoliacion"
  | "masajeCapilar"
  | "corteUnas"
  | "depilacion";

export interface HabitDefinition {
  key: HabitKey;
  label: string; // label canónico en hygiene_items
  frequencyDays: number;
}

// El orden desempata cuando dos hábitos van igual de atrasados: primero los
// más básicos de higiene.
export const DIVA_HABITS: HabitDefinition[] = [
  { key: "ducha", label: "Ducha", frequencyDays: 1 },
  { key: "cepillado", label: "Cepillado", frequencyDays: 1 },
  { key: "desodorante", label: "Desodorante", frequencyDays: 1 },
  { key: "lavadoPelo", label: "Lavado de pelo", frequencyDays: 3 },
  { key: "enjuagueBucal", label: "Enjuague bucal", frequencyDays: 1 },
  { key: "hiloDental", label: "Hilo dental", frequencyDays: 1 },
  { key: "protectorSolar", label: "Protector solar", frequencyDays: 1 },
  { key: "skincare", label: "Skincare", frequencyDays: 1 },
  { key: "aplicacionCrema", label: "Aplicación de crema", frequencyDays: 1 },
  { key: "exfoliacion", label: "Exfoliación", frequencyDays: 7 },
  { key: "masajeCapilar", label: "Masaje capilar", frequencyDays: 7 },
  { key: "corteUnas", label: "Corte de uñas", frequencyDays: 14 },
  { key: "depilacion", label: "Depilación", frequencyDays: 21 },
];

export const HABITS_BY_KEY: Record<HabitKey, HabitDefinition> = Object.fromEntries(
  DIVA_HABITS.map((h) => [h.key, h])
) as Record<HabitKey, HabitDefinition>;

export function habitKeyForItem(item: { label: string; is_hair_wash?: boolean | null }): HabitKey | null {
  if (item.is_hair_wash) return "lavadoPelo";
  return DIVA_HABITS.find((h) => h.label === item.label)?.key ?? null;
}
