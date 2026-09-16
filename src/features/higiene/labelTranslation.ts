import type { TranslationKey } from "@/lib/i18n";

// Los ítems de higiene se guardan en Supabase con su label canónico en
// español (no cambia con el idioma, así se puede comparar/deduplicar sin
// importar en qué idioma esté usando la app el usuario — ver
// AddHygieneItemPicker.tsx). Este mapa traduce ese label canónico a la
// clave de i18n correspondiente para mostrarlo en el idioma elegido.
// Cualquier label que no matchee (ítem viejo, o agregado antes de que
// existiera este mapa) cae de vuelta al texto tal cual.
export const HYGIENE_LABEL_TO_KEY: Record<string, TranslationKey> = {
  Ducha: "higiene.default.ducha",
  Cepillado: "higiene.default.cepillado",
  "Enjuague bucal": "higiene.default.enjuagueBucal",
  Desodorante: "higiene.default.desodorante",
  "Lavado de pelo": "higiene.default.lavadoPelo",
  "Hilo dental": "higiene.preset.hiloDental",
  "Aplicación de crema": "higiene.preset.aplicacionCrema",
  "Protector solar": "higiene.preset.protectorSolar",
  "Corte de uñas": "higiene.preset.corteUnas",
  Depilación: "higiene.preset.depilacion",
  Skincare: "higiene.preset.skincare",
  Exfoliación: "higiene.preset.exfoliacion",
  "Masaje capilar": "higiene.preset.masajeCapilar",
};

export function translateHygieneLabel(t: (key: TranslationKey) => string, label: string): string {
  const key = HYGIENE_LABEL_TO_KEY[label];
  return key ? t(key) : label;
}
