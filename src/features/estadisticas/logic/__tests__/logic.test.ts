import { buildReport, type RangeData } from "../aggregate";
import { canGoForward, comparisonPeriod, latestPeriod, pendingCurrentPeriod, shiftPeriod } from "../periods";
import { clusterTexts, extractColors, similarity, tokenize } from "../text";

// Sábado 3 de octubre de 2026.
const SAT = new Date(2026, 9, 3, 12, 0);
// Domingo 4 de octubre de 2026.
const SUN = new Date(2026, 9, 4, 12, 0);

describe("periods", () => {
  it("el semanal muestra la semana anterior hasta que llega el domingo", () => {
    expect(latestPeriod("week", SAT)).toEqual({ kind: "week", from: "2026-09-21", to: "2026-09-27" });
    expect(latestPeriod("week", SUN)).toEqual({ kind: "week", from: "2026-09-28", to: "2026-10-04" });
    expect(pendingCurrentPeriod("week", SAT)?.to).toBe("2026-10-04");
    expect(pendingCurrentPeriod("week", SUN)).toBeNull();
  });

  it("el mensual muestra el mes anterior hasta el último día del mes", () => {
    expect(latestPeriod("month", SAT)).toEqual({ kind: "month", from: "2026-09-01", to: "2026-09-30" });
    expect(latestPeriod("month", new Date(2026, 9, 31, 10))).toEqual({
      kind: "month",
      from: "2026-10-01",
      to: "2026-10-31",
    });
  });

  it("el anual es lo que va del año y compara con el mismo tramo del año anterior", () => {
    const year = latestPeriod("year", SAT);
    expect(year).toEqual({ kind: "year", from: "2026-01-01", to: "2026-10-03" });
    expect(comparisonPeriod(year, SAT)).toEqual({ kind: "year", from: "2025-01-01", to: "2025-10-03" });
    expect(shiftPeriod(year, -1, SAT)).toEqual({ kind: "year", from: "2025-01-01", to: "2025-12-31" });
  });

  it("no deja avanzar más allá del último informe disponible", () => {
    const week = latestPeriod("week", SAT);
    expect(canGoForward(week, SAT)).toBe(false);
    expect(canGoForward(shiftPeriod(week, -1, SAT), SAT)).toBe(true);
  });
});

describe("text", () => {
  it("reconoce descripciones parecidas", () => {
    const a = tokenize("Jeans azules con polera blanca");
    const b = tokenize("polera blanca y jeans azul");
    expect(similarity(a, b)).toBeGreaterThanOrEqual(0.6);
    expect(similarity(a, tokenize("Vestido rojo"))).toBeLessThan(0.6);
  });

  it("agrupa outfits repetidos y marca su primera aparición", () => {
    const clusters = clusterTexts([
      { id: "1", date: "2026-09-02", text: "Jeans azules con polera blanca" },
      { id: "2", date: "2026-09-10", text: "Vestido rojo" },
      { id: "3", date: "2026-09-15", text: "polera blanca y jeans azul" },
    ]);
    expect(clusters).toHaveLength(2);
    expect(clusters[0].ids).toEqual(["1", "3"]);
    expect(clusters[0].firstDate).toBe("2026-09-02");
  });

  it("trata colores en femenino/masculino como el mismo zapato", () => {
    expect(similarity(tokenize("zapatilla Nike blancas"), tokenize("zapatilla nike blanco"))).toBe(1);
  });

  it("extrae colores con sus variantes", () => {
    expect(extractColors("Polera ROJA, jeans negros y zapatillas verdes").sort()).toEqual(["negro", "rojo", "verde"]);
    expect(extractColors("chaqueta Burdeo")).toEqual(["rojo"]);
  });
});

function emptyRange(): RangeData {
  return {
    moods: [],
    meals: [],
    exercises: [],
    makeupDates: [],
    hairstyles: [],
    faceProducts: [],
    outfits: [],
    shoes: [],
    hygieneLogs: [],
    social: [],
    extraExpenses: [],
    tastes: [],
    notesShort: 0,
    notesLong: 0,
  };
}

describe("buildReport", () => {
  const period = { kind: "month" as const, from: "2026-09-01", to: "2026-09-30" };

  it("compara ánimos con el periodo anterior y arma la frase destacada", () => {
    const current = { ...emptyRange(), moods: ["mal", "mal", "mal", "mal", "bien"].map((mood, i) => ({ date: `2026-09-0${i + 1}`, mood })) };
    const previous = { ...emptyRange(), moods: [{ date: "2026-08-01", mood: "mal" }] };
    const report = buildReport({
      period,
      current,
      previous,
      history: { hairstyles: [], outfits: [], shoes: [] },
      hygieneItems: [],
    });
    expect(report.bienestar.moods[0]).toMatchObject({ key: "mal", count: 4, previous: 1 });
    expect(report.highlights).toContainEqual({ type: "moodChange", mood: "mal", diff: 3 });
  });

  it("cuenta ejercicios escritos distinto como el mismo", () => {
    const current = {
      ...emptyRange(),
      exercises: ["Sentadillas", "sentadilla", "SENTADILLAS", "Yoga"].map((type) => ({ date: "2026-09-05", type })),
    };
    const report = buildReport({
      period,
      current,
      previous: null,
      history: { hairstyles: [], outfits: [], shoes: [] },
      hygieneItems: [],
    });
    expect(report.bienestar.exercises[0]).toMatchObject({ label: "Sentadillas", count: 3 });
  });

  it("distingue peinados y outfits nuevos de los repetidos, y el color del mes", () => {
    const outfits = [
      { id: "o1", date: "2026-08-20", text: "Vestido rojo largo", colorText: "rojo" },
      { id: "o2", date: "2026-09-02", text: "vestido largo rojo", colorText: "rojo" },
      { id: "o3", date: "2026-09-09", text: "Vestido rojo largo", colorText: "rojo" },
      { id: "o4", date: "2026-09-12", text: "Polera roja y jeans", colorText: "rojo azul" },
    ];
    const hairstyles = [
      { date: "2026-08-01", name: "Trenza" },
      { date: "2026-09-03", name: "trenza" },
      { date: "2026-09-04", name: "Moño alto" },
    ];
    const current = {
      ...emptyRange(),
      outfits: outfits.filter((o) => o.date >= "2026-09-01"),
      hairstyles: hairstyles.filter((h) => h.date >= "2026-09-01"),
    };
    const report = buildReport({
      period,
      current,
      previous: null,
      history: { hairstyles, outfits, shoes: [] },
      hygieneItems: [],
    });
    expect(report.imagen.outfits.total).toBe(3);
    expect(report.imagen.outfits.newCount).toBe(1);
    expect(report.imagen.outfits.repeats).toEqual([{ label: "Vestido rojo largo", count: 2 }]);
    expect(report.imagen.outfits.topColor).toEqual({ color: "rojo", count: 3 });
    expect(report.imagen.hairstylesNew).toBe(1);
    expect(report.highlights).toContainEqual({ type: "outfitColor", color: "rojo", count: 3 });
  });

  it("muestra todos los hábitos activos aunque tengan 0, y la semana más social", () => {
    const current = {
      ...emptyRange(),
      hygieneLogs: [{ itemId: "ducha", date: "2026-09-01" }],
      social: ["2026-09-08", "2026-09-09", "2026-09-10", "2026-09-20"].map((date) => ({ date, type: "amistosa" })),
    };
    const report = buildReport({
      period,
      current,
      previous: null,
      history: { hairstyles: [], outfits: [], shoes: [] },
      hygieneItems: [
        { id: "ducha", label: "Ducha" },
        { id: "cepillado", label: "Cepillado" },
      ],
    });
    expect(report.higiene.map((h) => h.count)).toEqual([1, 0]);
    expect(report.social.busiestWeek).toEqual({ from: "2026-09-07", count: 3 });
  });

  it("ordena los gustos por estrellas", () => {
    const current = {
      ...emptyRange(),
      tastes: [
        { date: "2026-09-01", name: "Serie A", rating: 3, category: "serie" },
        { date: "2026-09-02", name: "Disco B", rating: 5, category: "musica" },
        { date: "2026-09-03", name: "Libro C", rating: null, category: "libro" },
      ],
    };
    const report = buildReport({
      period,
      current,
      previous: null,
      history: { hairstyles: [], outfits: [], shoes: [] },
      hygieneItems: [],
    });
    expect(report.gustos.map((g) => g.name)).toEqual(["Disco B", "Serie A", "Libro C"]);
    expect(report.highlights).toContainEqual({ type: "topTaste", name: "Disco B", rating: 5 });
  });
});
