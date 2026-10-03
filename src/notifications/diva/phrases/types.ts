import type { HabitKey } from "../habits";
import type { IntensityLevel, WellnessInsight } from "../planner";

export interface Phrase {
  title: string;
  body: string;
}

// Banco de frases de un idioma. Nivel 1 = recién atrasada (suave), nivel 2 =
// bastante atrasada (más shady), nivel 3 = muy atrasada (dramático pero
// tierno). En "streak", {days} se reemplaza por los días de racha.
export interface PhraseBank {
  habits: Record<HabitKey, Record<IntensityLevel, Phrase[]>>;
  inactivity: Phrase[];
  streak: Phrase[];
  wellness: Record<WellnessInsight, Phrase[]>;
}
