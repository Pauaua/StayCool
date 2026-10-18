import { translate, type Language, type TranslationKey } from "@/lib/i18n";

// La función `resumen` del servidor devuelve valores canónicos en español
// (tipo de gasto, tipo de actividad, ánimo promedio). Acá se traducen al
// idioma de la usuaria; si alguno no tiene clave, se muestra tal cual.
function translateWithPrefixes(lang: Language, value: string, prefixes: string[]): string {
  for (const prefix of prefixes) {
    const key = `${prefix}.${value}` as TranslationKey;
    const text = translate(lang, key);
    if (text !== key) return text;
  }
  return value;
}

export const expenseCategoryLabel = (lang: Language, value: string) =>
  translateWithPrefixes(lang, value, ["gastos.type", "gastos.kind"]);

export const activityTypeLabel = (lang: Language, value: string) =>
  translateWithPrefixes(lang, value, ["social.type"]);

export const feelingLabel = (lang: Language, value: string) =>
  translateWithPrefixes(lang, value, ["bienestar.mood"]);
