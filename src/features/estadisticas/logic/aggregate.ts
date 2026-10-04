// Arma el informe de un periodo a partir de los registros crudos. Es lógica
// pura (sin Supabase ni i18n) para poder testearla: solo cuenta lo que la
// persona registró, nada se inventa.

import { weekStartOf, type Period } from "./periods";
import { clusterTexts, extractColors, tokenize, type ColorKey, type TextEntry } from "./text";

export interface RangeData {
  moods: { date: string; mood: string }[];
  meals: { date: string; category: string | null }[];
  exercises: { date: string; type: string }[];
  makeupDates: string[];
  hairstyles: { date: string; name: string }[];
  faceProducts: { date: string; category: string }[];
  outfits: { id: string; date: string; text: string; colorText: string }[];
  shoes: { id: string; date: string; text: string; colorText: string }[];
  hygieneLogs: { itemId: string; date: string }[];
  social: { date: string; type: string }[];
  extraExpenses: { date: string }[];
  tastes: { date: string; name: string; rating: number | null; category: string }[];
  notesShort: number;
  notesLong: number;
}

// Registros de todo el historial (hasta el fin del periodo), para saber si
// un peinado/outfit/zapato es nuevo o repetido.
export interface IdentityHistory {
  hairstyles: { date: string; name: string }[];
  outfits: TextEntry[];
  shoes: TextEntry[];
}

export interface Count {
  key: string;
  label: string;
  count: number;
  previous: number | null;
}

export interface Repeat {
  label: string;
  count: number;
}

export interface WardrobeStats {
  total: number;
  newCount: number;
  repeats: Repeat[];
  topColor: { color: ColorKey; count: number } | null;
}

export type Highlight =
  | { type: "moodChange"; mood: string; diff: number }
  | { type: "topExercise"; label: string; count: number }
  | { type: "outfitColor"; color: ColorKey; count: number }
  | { type: "favoriteOutfit"; label: string; count: number }
  | { type: "busiestWeek"; from: string; count: number }
  | { type: "socialChange"; diff: number }
  | { type: "topTaste"; name: string; rating: number };

export interface Report {
  period: Period;
  hasData: boolean;
  hasComparison: boolean;
  highlights: Highlight[];
  bienestar: { moods: Count[]; meals: Count[]; exercises: Count[] };
  imagen: {
    makeupDays: Count;
    hairstylesNew: number;
    hairstyleRepeats: Repeat[];
    faceProductsNew: Count[];
    outfits: WardrobeStats;
    shoes: WardrobeStats;
  };
  higiene: Count[];
  social: { total: Count; byType: Count[]; busiestWeek: { from: string; count: number } | null };
  gastos: { extras: Count };
  gustos: { name: string; rating: number | null; category: string }[];
  notas: { short: Count; long: Count };
}

const inRange = (date: string, period: Period) => date >= period.from && date <= period.to;

function tally<T>(items: T[], keyOf: (item: T) => string | null): Map<string, number> {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = keyOf(item);
    if (!key) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

function toCounts(
  current: Map<string, number>,
  previous: Map<string, number> | null,
  labelOf: (key: string) => string = (key) => key
): Count[] {
  const keys = new Set([...current.keys(), ...(previous?.keys() ?? [])]);
  return [...keys]
    .map((key) => ({
      key,
      label: labelOf(key),
      count: current.get(key) ?? 0,
      previous: previous ? previous.get(key) ?? 0 : null,
    }))
    .sort((a, b) => b.count - a.count || (b.previous ?? 0) - (a.previous ?? 0));
}

const single = (key: string, count: number, previous: number | null): Count => ({ key, label: key, count, previous });

// Clave para textos libres cortos (ejercicios, peinados): mismas palabras
// sin importar mayúsculas, tildes, orden ni plural.
function textKey(text: string): string | null {
  const key = [...tokenize(text)].sort().join(" ");
  return key || null;
}

// Primer texto tal como se escribió, para mostrar.
function labelsByKey(entries: { name: string }[]): Map<string, string> {
  const labels = new Map<string, string>();
  for (const entry of entries) {
    const key = textKey(entry.name);
    if (key && !labels.has(key)) labels.set(key, entry.name.trim());
  }
  return labels;
}

function topColor(texts: string[]): { color: ColorKey; count: number } | null {
  const counts = tally(texts.flatMap(extractColors), (c) => c);
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0 || sorted[0][1] < 2) return null;
  // Solo hay "color del periodo" si gana claramente.
  if (sorted.length > 1 && sorted[1][1] === sorted[0][1]) return null;
  return { color: sorted[0][0] as ColorKey, count: sorted[0][1] };
}

function wardrobeStats(
  period: Period,
  inPeriod: { id: string; colorText: string }[],
  history: TextEntry[]
): WardrobeStats {
  const ids = new Set(inPeriod.map((e) => e.id));
  const clusters = clusterTexts(history);
  const repeats: Repeat[] = [];
  let newCount = 0;
  for (const cluster of clusters) {
    const uses = cluster.ids.filter((id) => ids.has(id)).length;
    if (uses === 0) continue;
    if (inRange(cluster.firstDate, period)) newCount++;
    if (uses >= 2) repeats.push({ label: cluster.label, count: uses });
  }
  return {
    total: inPeriod.length,
    newCount,
    repeats: repeats.sort((a, b) => b.count - a.count),
    topColor: topColor(inPeriod.map((e) => e.colorText)),
  };
}

export function buildReport(input: {
  period: Period;
  current: RangeData;
  previous: RangeData | null;
  history: IdentityHistory;
  hygieneItems: { id: string; label: string }[];
}): Report {
  const { period, current: cur, previous: prev, history, hygieneItems } = input;

  // Bienestar
  const moods = toCounts(
    tally(cur.moods, (m) => m.mood),
    prev ? tally(prev.moods, (m) => m.mood) : null
  );
  const meals = toCounts(
    tally(cur.meals, (m) => m.category),
    prev ? tally(prev.meals, (m) => m.category) : null
  );
  const exerciseLabels = labelsByKey([...(prev?.exercises ?? []), ...cur.exercises].map((e) => ({ name: e.type })));
  const exercises = toCounts(
    tally(cur.exercises, (e) => textKey(e.type)),
    prev ? tally(prev.exercises, (e) => textKey(e.type)) : null,
    (key) => exerciseLabels.get(key) ?? key
  );

  // Imagen
  const hairstyleHistory = history.hairstyles;
  const firstHairstyleDate = new Map<string, string>();
  for (const h of [...hairstyleHistory].sort((a, b) => a.date.localeCompare(b.date))) {
    const key = textKey(h.name);
    if (key && !firstHairstyleDate.has(key)) firstHairstyleDate.set(key, h.date);
  }
  const hairstyleUses = tally(cur.hairstyles, (h) => textKey(h.name));
  const hairstyleLabels = labelsByKey(hairstyleHistory);
  const hairstylesNew = [...hairstyleUses.keys()].filter((key) =>
    inRange(firstHairstyleDate.get(key) ?? period.from, period)
  ).length;
  const hairstyleRepeats = [...hairstyleUses.entries()]
    .filter(([, count]) => count >= 2)
    .map(([key, count]) => ({ label: hairstyleLabels.get(key) ?? key, count }))
    .sort((a, b) => b.count - a.count);

  const outfits = wardrobeStats(period, cur.outfits, history.outfits);
  const shoes = wardrobeStats(period, cur.shoes, history.shoes);

  // Cuidado Personal: solo los ítems activos, aunque tengan 0.
  const hygieneCurrent = tally(cur.hygieneLogs, (l) => l.itemId);
  const hygienePrevious = prev ? tally(prev.hygieneLogs, (l) => l.itemId) : null;
  const higiene = hygieneItems.map((item) => ({
    key: item.id,
    label: item.label,
    count: hygieneCurrent.get(item.id) ?? 0,
    previous: hygienePrevious ? hygienePrevious.get(item.id) ?? 0 : null,
  }));

  // Social
  const byWeek = tally(cur.social, (s) => weekStartOf(s.date));
  const busiest = [...byWeek.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
  const showBusiestWeek = period.kind === "month" || period.kind === "year";
  const social = {
    total: single("social", cur.social.length, prev ? prev.social.length : null),
    byType: toCounts(
      tally(cur.social, (s) => s.type),
      prev ? tally(prev.social, (s) => s.type) : null
    ),
    busiestWeek: showBusiestWeek && busiest ? { from: busiest[0], count: busiest[1] } : null,
  };

  const report: Report = {
    period,
    hasData: false,
    hasComparison: prev !== null,
    highlights: [],
    bienestar: { moods, meals, exercises },
    imagen: {
      makeupDays: single("makeup", cur.makeupDates.length, prev ? prev.makeupDates.length : null),
      hairstylesNew,
      hairstyleRepeats,
      faceProductsNew: toCounts(
        tally(cur.faceProducts, (p) => p.category),
        prev ? tally(prev.faceProducts, (p) => p.category) : null
      ),
      outfits,
      shoes,
    },
    higiene,
    social,
    gastos: { extras: single("extras", cur.extraExpenses.length, prev ? prev.extraExpenses.length : null) },
    gustos: [...cur.tastes]
      .sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1) || b.date.localeCompare(a.date))
      .map(({ name, rating, category }) => ({ name, rating, category })),
    notas: {
      short: single("short", cur.notesShort, prev ? prev.notesShort : null),
      long: single("long", cur.notesLong, prev ? prev.notesLong : null),
    },
  };

  report.hasData =
    cur.moods.length +
      cur.meals.length +
      cur.exercises.length +
      cur.makeupDates.length +
      cur.hairstyles.length +
      cur.faceProducts.length +
      cur.outfits.length +
      cur.shoes.length +
      cur.hygieneLogs.length +
      cur.social.length +
      cur.extraExpenses.length +
      cur.tastes.length +
      cur.notesShort +
      cur.notesLong >
    0;
  report.highlights = buildHighlights(report, prev);
  return report;
}

// Frases destacadas del periodo ("esta semana te sentiste mal 3 veces más
// que la semana pasada", "este mes tu color fue el rojo"...). Se arman acá
// como datos; el texto lo pone la pantalla según el idioma.
export function buildHighlights(report: Report, prev: RangeData | null): Highlight[] {
  const highlights: Highlight[] = [];
  const { bienestar, imagen, social, gustos } = report;

  if (prev && prev.moods.length > 0) {
    const change = bienestar.moods
      .map((m) => ({ mood: m.key, diff: m.count - (m.previous ?? 0) }))
      .filter((m) => m.diff !== 0)
      .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))[0];
    if (change) highlights.push({ type: "moodChange", ...change });
  }

  const topExercise = bienestar.exercises[0];
  if (topExercise && topExercise.count >= 2) {
    highlights.push({ type: "topExercise", label: topExercise.label, count: topExercise.count });
  }

  if (imagen.outfits.topColor && imagen.outfits.topColor.count >= 3) {
    highlights.push({ type: "outfitColor", ...imagen.outfits.topColor });
  }

  const favorite = imagen.outfits.repeats[0];
  if (favorite) highlights.push({ type: "favoriteOutfit", label: favorite.label, count: favorite.count });

  if (prev && social.total.previous !== null && social.total.count !== social.total.previous) {
    highlights.push({ type: "socialChange", diff: social.total.count - social.total.previous });
  }

  if (social.busiestWeek && social.busiestWeek.count >= 2) {
    highlights.push({ type: "busiestWeek", ...social.busiestWeek });
  }

  const topTaste = gustos[0];
  if (topTaste && topTaste.rating === 5) {
    highlights.push({ type: "topTaste", name: topTaste.name, rating: topTaste.rating });
  }

  return highlights;
}
