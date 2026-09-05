export type ResumenPeriod = "weekly" | "monthly" | "yearly";

export interface ResumenData {
  from: string;
  to: string;
  displayName: string | null;
  bienestar: {
    avgSleepMinutes: number;
    mealsCount: number;
    exerciseCount: number;
  };
  higiene: {
    completionPercent: number;
  };
  pelo: {
    washCount: number;
    distinctHairstylesCount: number;
  };
  cara: {
    makeupDays: number;
  };
  imagen: {
    outfitsCount: number;
  };
  social: {
    activitiesCount: number;
    typeBreakdown: Record<string, number>;
    avgFeelingLabel: string | null;
  };
  gastos: {
    total: number;
    breakdown: Record<string, number>;
  };
  comparison: {
    hygieneCompletionPercentDelta: number;
    exerciseCountDelta: number;
    activitiesCountDelta: number;
    gastosTotalDelta: number;
  };
}
