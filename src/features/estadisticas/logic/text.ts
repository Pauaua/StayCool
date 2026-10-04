// Comparación de textos libres (descripciones de outfits, zapatos,
// peinados, ejercicios) para detectar "lo mismo" escrito de formas
// parecidas: sin tildes, sin mayúsculas, sin palabras de relleno y sin
// importar el orden ni el plural.

const STOPWORDS = new Set([
  "de", "del", "la", "el", "los", "las", "y", "e", "o", "con", "sin", "un", "una", "unos", "unas",
  "en", "a", "al", "mi", "mis", "para", "por", "que", "muy",
  "the", "and", "or", "with", "of", "my", "an", "in",
]);

export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9ñ]+/g, " ")
    .trim();
}

// Plural simple: "zapatillas" -> "zapatilla", "jeans" -> "jean".
function singular(word: string): string {
  if (word.length > 4 && word.endsWith("es") && !word.endsWith("ies")) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s")) return word.slice(0, -1);
  return word;
}

// Los colores se llevan a su forma base ("blancas" -> "blanco") para que
// "zapatillas blancas" y "zapatilla blanco" cuenten como lo mismo.
export function tokenize(text: string): Set<string> {
  return new Set(
    normalizeText(text)
      .split(" ")
      .filter((w) => w.length > 1 && !STOPWORDS.has(w))
      .map((w) => colorOf(w) ?? singular(w))
  );
}

export function similarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  a.forEach((token) => {
    if (b.has(token)) shared++;
  });
  return shared / (a.size + b.size - shared);
}

export interface TextEntry {
  id: string;
  date: string;
  text: string;
}

export interface TextCluster {
  key: string;
  label: string; // el texto tal como se escribió la primera vez
  firstDate: string;
  ids: string[];
}

// Agrupa textos parecidos (similitud >= threshold), en orden cronológico:
// cada grupo se identifica por su primera aparición.
export function clusterTexts(entries: TextEntry[], threshold = 0.6): TextCluster[] {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const clusters: (TextCluster & { tokens: Set<string> })[] = [];
  for (const entry of sorted) {
    const tokens = tokenize(entry.text);
    if (tokens.size === 0) continue;
    let best: (typeof clusters)[number] | null = null;
    let bestScore = 0;
    for (const cluster of clusters) {
      const score = similarity(tokens, cluster.tokens);
      if (score > bestScore) {
        best = cluster;
        bestScore = score;
      }
    }
    if (best && bestScore >= threshold) {
      best.ids.push(entry.id);
    } else {
      clusters.push({
        key: `c${clusters.length}`,
        label: entry.text.trim(),
        firstDate: entry.date,
        ids: [entry.id],
        tokens,
      });
    }
  }
  return clusters.map(({ tokens: _tokens, ...cluster }) => cluster);
}

// Colores reconocidos en descripciones libres, con sus variantes.
export const COLOR_KEYS = [
  "rojo", "negro", "blanco", "azul", "celeste", "verde", "amarillo", "rosado",
  "morado", "naranjo", "gris", "cafe", "beige", "dorado", "plateado",
] as const;
export type ColorKey = (typeof COLOR_KEYS)[number];

const COLOR_WORDS: Record<ColorKey, string[]> = {
  rojo: ["rojo", "roja", "red", "burdeo", "granate"],
  negro: ["negro", "negra", "black"],
  blanco: ["blanco", "blanca", "white"],
  azul: ["azul", "blue", "marino"],
  celeste: ["celeste", "turquesa", "calipso"],
  verde: ["verde", "green", "oliva"],
  amarillo: ["amarillo", "amarilla", "yellow", "mostaza"],
  rosado: ["rosado", "rosada", "rosa", "pink", "fucsia"],
  morado: ["morado", "morada", "lila", "violeta", "purple"],
  naranjo: ["naranjo", "naranja", "orange"],
  gris: ["gris", "grey", "gray", "plomo"],
  cafe: ["cafe", "marron", "brown", "chocolate", "camel"],
  beige: ["beige", "crema", "nude", "hueso"],
  dorado: ["dorado", "dorada", "gold"],
  plateado: ["plateado", "plateada", "silver"],
};

const WORD_TO_COLOR = new Map<string, ColorKey>();
for (const key of COLOR_KEYS) {
  for (const word of COLOR_WORDS[key]) WORD_TO_COLOR.set(word, key);
}

// "verdes" -> "verde", "grises" -> "gris", "rojos" -> "rojo".
function colorOf(word: string): ColorKey | undefined {
  return WORD_TO_COLOR.get(word) ?? WORD_TO_COLOR.get(word.slice(0, -1)) ?? WORD_TO_COLOR.get(word.slice(0, -2));
}

export function extractColors(text: string): ColorKey[] {
  const found = new Set<ColorKey>();
  for (const word of normalizeText(text).split(" ")) {
    const color = colorOf(word);
    if (color) found.add(color);
  }
  return [...found];
}
