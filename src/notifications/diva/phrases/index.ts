import type { PlannedKind } from "../planner";
import { EN } from "./en";
import { ES } from "./es";
import type { Phrase, PhraseBank } from "./types";

export type { Phrase, PhraseBank } from "./types";
export type PhraseLanguage = "es" | "en";

export const PHRASES: Record<PhraseLanguage, PhraseBank> = { es: ES, en: EN };

// Clave estable por "tipo" de frase, para recordar cuáles se usaron hace
// poco (no depende del idioma: el índice es el mismo en es/en).
export function phraseCategory(kind: PlannedKind): string {
  switch (kind.type) {
    case "habit":
      return `habit:${kind.habit}:${kind.level}`;
    case "wellness":
      return `wellness:${kind.insight}`;
    default:
      return kind.type;
  }
}

export function phrasesFor(kind: PlannedKind, lang: PhraseLanguage): Phrase[] {
  const bank = PHRASES[lang];
  switch (kind.type) {
    case "habit":
      return bank.habits[kind.habit][kind.level];
    case "inactivity":
      return bank.inactivity;
    case "streak":
      return bank.streak;
    case "wellness":
      return bank.wellness[kind.insight];
  }
}

// Elige un índice al azar evitando los usados recientemente. Si todos están
// "recientes", evita al menos el último, para no repetir dos veces seguidas.
export function pickPhraseIndex(count: number, recent: number[], random: () => number = Math.random): number {
  const all = Array.from({ length: count }, (_, i) => i);
  let options = all.filter((i) => !recent.includes(i));
  if (options.length === 0) {
    const last = recent[recent.length - 1];
    options = all.filter((i) => i !== last);
  }
  if (options.length === 0) options = all;
  return options[Math.floor(random() * options.length)];
}

export function renderPhrase(phrase: Phrase, kind: PlannedKind): Phrase {
  if (kind.type !== "streak") return phrase;
  const days = String(kind.days);
  return { title: phrase.title.replaceAll("{days}", days), body: phrase.body.replaceAll("{days}", days) };
}
