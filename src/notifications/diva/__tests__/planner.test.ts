import { DIVA_HABITS } from "../habits";
import {
  computeStreak,
  levelForDaysLate,
  pickWellnessInsight,
  planDivaNotifications,
  streakMilestoneToCelebrate,
  type PlannerInput,
} from "../planner";
import { PHRASES, pickPhraseIndex, renderPhrase } from "../phrases";

// Miércoles 7 de octubre de 2026, 8:00 hora local.
const NOW = new Date(2026, 9, 7, 8, 0);

function input(overrides: Partial<PlannerInput> = {}): PlannerInput {
  return { now: NOW, habits: [], streakDays: 0, lastStreakCelebrated: 0, wellness: null, ...overrides };
}

const dayKey = (d: Date) => `${d.getMonth() + 1}-${d.getDate()}`;

describe("planDivaNotifications", () => {
  it("programa el pelo para el día en que vence (lavado hace 2 días, cada 3)", () => {
    const plan = planDivaNotifications(
      input({ habits: [{ key: "lavadoPelo", lastDone: "2026-10-05", since: "2026-09-01" }] })
    );
    const first = plan.find((p) => p.kind.type === "habit");
    expect(first?.date).toEqual(new Date(2026, 9, 8, 19, 0));
    expect(first?.kind).toEqual({ type: "habit", habit: "lavadoPelo", level: 1 });
  });

  it("no recuerda hoy un hábito diario que ya se registró hoy", () => {
    const plan = planDivaNotifications(
      input({ habits: [{ key: "ducha", lastDone: "2026-10-07", since: "2026-09-01" }] })
    );
    expect(plan.some((p) => dayKey(p.date) === "10-7")).toBe(false);
    expect(plan[0].date).toEqual(new Date(2026, 9, 8, 19, 0));
  });

  it("nunca pasa de 2 por día ni sale del horario 9:00-21:00", () => {
    const habits = DIVA_HABITS.map((h) => ({ key: h.key, lastDone: "2026-09-01", since: "2026-08-01" }));
    const plan = planDivaNotifications(
      input({ habits, streakDays: 7, wellness: "sleepLow", now: new Date(2026, 9, 7, 6, 0) })
    );
    const perDay = new Map<string, number>();
    for (const p of plan) {
      perDay.set(dayKey(p.date), (perDay.get(dayKey(p.date)) ?? 0) + 1);
      expect(p.date.getHours()).toBeGreaterThanOrEqual(9);
      expect(p.date.getHours()).toBeLessThan(21);
    }
    expect(Math.max(...perDay.values())).toBeLessThanOrEqual(2);
  });

  it("no programa nada en el pasado ni en los próximos 10 minutos", () => {
    const late = new Date(2026, 9, 7, 18, 55);
    const plan = planDivaNotifications(
      input({ now: late, habits: [{ key: "ducha", lastDone: "2026-10-05", since: "2026-09-01" }] })
    );
    expect(plan.every((p) => p.date.getTime() > late.getTime() + 10 * 60 * 1000)).toBe(true);
  });

  it("sube de nivel con el atraso y en nivel 3 recuerda día por medio", () => {
    const plan = planDivaNotifications(
      input({ habits: [{ key: "ducha", lastDone: "2026-10-04", since: "2026-09-01" }] })
    );
    const levels = plan.filter((p) => p.kind.type === "habit").map((p) => (p.kind as { level: number }).level);
    // Día 7: 3 días desde el registro -> 2 de atraso -> nivel 2.
    expect(levels[0]).toBe(2);
    expect(Math.max(...levels)).toBe(3);
    const level3Days = plan
      .filter((p) => p.kind.type === "habit" && (p.kind as { level: number }).level === 3)
      .map((p) => p.date.getDate());
    for (let i = 1; i < level3Days.length; i++) expect(level3Days[i] - level3Days[i - 1]).toBe(2);
  });

  it("solo agrega un segundo hábito el mismo día si va bastante atrasado", () => {
    const plan = planDivaNotifications(
      input({
        habits: [
          { key: "ducha", lastDone: "2026-10-06", since: "2026-09-01" },
          { key: "cepillado", lastDone: "2026-10-06", since: "2026-09-01" },
        ],
      })
    );
    const today = plan.filter((p) => dayKey(p.date) === "10-7");
    expect(today).toHaveLength(1);
    expect(today[0].kind).toEqual({ type: "habit", habit: "ducha", level: 1 });
  });

  it("avisa inactividad a los 3 y 6 días, en la mañana", () => {
    const plan = planDivaNotifications(input());
    const inactivity = plan.filter((p) => p.kind.type === "inactivity").map((p) => p.date);
    expect(inactivity).toEqual([new Date(2026, 9, 10, 11, 0), new Date(2026, 9, 13, 11, 0)]);
  });

  it("celebra la racha una sola vez por hito", () => {
    expect(planDivaNotifications(input({ streakDays: 3 })).some((p) => p.kind.type === "streak")).toBe(true);
    expect(
      planDivaNotifications(input({ streakDays: 4, lastStreakCelebrated: 3 })).some((p) => p.kind.type === "streak")
    ).toBe(false);
  });

  it("manda el aviso de Bienestar el domingo", () => {
    const plan = planDivaNotifications(input({ wellness: "sleepLow" }));
    const wellness = plan.filter((p) => p.kind.type === "wellness");
    expect(wellness).toHaveLength(1);
    expect(wellness[0].date.getDay()).toBe(0);
    expect(wellness[0].module).toBe("Bienestar");
  });
});

describe("helpers", () => {
  it("levelForDaysLate", () => {
    expect([0, 1, 2, 3, 4, 10].map(levelForDaysLate)).toEqual([1, 1, 2, 2, 3, 3]);
  });

  it("streakMilestoneToCelebrate", () => {
    expect(streakMilestoneToCelebrate(2, 0)).toBeNull();
    expect(streakMilestoneToCelebrate(5, 0)).toBe(3);
    expect(streakMilestoneToCelebrate(8, 3)).toBe(7);
    expect(streakMilestoneToCelebrate(60, 30)).toBe(60);
  });

  it("computeStreak cuenta hasta ayer si hoy todavía no está completo", () => {
    const ducha = new Set(["2026-10-04", "2026-10-05", "2026-10-06"]);
    const cepillado = new Set(["2026-10-05", "2026-10-06", "2026-10-07"]);
    expect(computeStreak(NOW, [ducha, cepillado])).toBe(2);
    expect(computeStreak(NOW, [])).toBe(0);
  });

  it("pickWellnessInsight prioriza el ánimo y no reta sin datos", () => {
    const base = { sleepMinutes: [], exerciseSessionsWeek: 0, exerciseSessionsMonth: 0, lowMoodDays: 0 };
    expect(pickWellnessInsight(base)).toBeNull();
    expect(pickWellnessInsight({ ...base, lowMoodDays: 3, sleepMinutes: [300, 300, 300] })).toBe("moodLow");
    expect(pickWellnessInsight({ ...base, sleepMinutes: [300, 320, 350] })).toBe("sleepLow");
    expect(pickWellnessInsight({ ...base, exerciseSessionsMonth: 2 })).toBe("noExercise");
    expect(pickWellnessInsight({ ...base, sleepMinutes: [480, 470, 500] })).toBe("sleepGood");
  });

  it("pickPhraseIndex no repite lo reciente", () => {
    for (let i = 0; i < 50; i++) {
      expect([0, 1, 2]).not.toContain(pickPhraseIndex(6, [0, 1, 2]));
    }
    expect(pickPhraseIndex(2, [0, 1], () => 0)).toBe(0);
  });

  it("renderPhrase reemplaza los días de racha", () => {
    const phrase = renderPhrase(PHRASES.es.streak[0], { type: "streak", days: 4 });
    expect(phrase.body).toContain("4 días");
    expect(phrase.body).not.toContain("{days}");
  });
});

describe("banco de frases", () => {
  it("tiene al menos 6 frases por hábito y nivel, y el mismo largo en es/en", () => {
    for (const habit of DIVA_HABITS) {
      for (const level of [1, 2, 3] as const) {
        const es = PHRASES.es.habits[habit.key][level];
        const en = PHRASES.en.habits[habit.key][level];
        expect(es.length).toBeGreaterThanOrEqual(6);
        expect(en.length).toBe(es.length);
      }
    }
    for (const lang of ["es", "en"] as const) {
      const bank = PHRASES[lang];
      expect(bank.inactivity.length).toBeGreaterThanOrEqual(6);
      expect(bank.streak.length).toBeGreaterThanOrEqual(6);
      for (const list of Object.values(bank.wellness)) expect(list.length).toBeGreaterThanOrEqual(6);
    }
  });
});
