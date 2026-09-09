import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { translate, type Language } from "@/lib/i18n";
import type { ResumenData, ResumenPeriod } from "@/features/resumen/types";

function formatSleep(minutes: number) {
  if (minutes <= 0) return "—";
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
}

function formatMoney(amount: number, lang: Language) {
  const locale = lang === "en" ? "en-US" : "es-AR";
  return `$${amount.toLocaleString(locale, { maximumFractionDigits: 0 })}`;
}

const PERIOD_KEY: Record<ResumenPeriod, "resumen.period.weekly" | "resumen.period.monthly" | "resumen.period.yearly"> = {
  weekly: "resumen.period.weekly",
  monthly: "resumen.period.monthly",
  yearly: "resumen.period.yearly",
};

// Mismo dataset que consumen el dashboard y la tarjeta compartible — un solo
// template HTML, renderizado a PDF con expo-print, para que las tres vistas
// nunca queden desincronizadas entre sí.
function buildResumenHtml(data: ResumenData, period: ResumenPeriod, lang: Language): string {
  const t = (key: Parameters<typeof translate>[1], vars?: Record<string, string>) => translate(lang, key, vars);

  const socialTypes = Object.entries(data.social.typeBreakdown)
    .map(([type, count]) => `${type} (${count})`)
    .join(", ") || "—";
  const gastosBreakdown = Object.entries(data.gastos.breakdown)
    .map(([kind, amount]) => `<tr><td>${kind}</td><td style="text-align:right">${formatMoney(amount, lang)}</td></tr>`)
    .join("");

  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #1d1a24; padding: 32px; }
        h1 { color: #b825f2; font-size: 22px; margin-bottom: 2px; }
        .period { color: #6b6178; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 24px; }
        .hero { font-size: 40px; font-weight: 800; margin: 0; }
        .hero-label { color: #6b6178; font-size: 12px; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        td { padding: 8px 0; border-bottom: 1px solid #e2d9ea; font-size: 13px; }
        .module { font-weight: 700; color: #7412a0; }
        footer { margin-top: 32px; font-size: 10px; color: #6b6178; text-align: center; }
      </style>
    </head>
    <body>
      <h1>${t("pdf.headerTitle")}</h1>
      <div class="period">${t(PERIOD_KEY[period])} · ${data.from} a ${data.to}</div>

      <p class="hero">${data.higiene.completionPercent}%${
    data.comparison.hygieneCompletionPercentDelta !== 0
      ? ` <span style="font-size:14px;color:${
          data.comparison.hygieneCompletionPercentDelta > 0 ? "#14a893" : "#e04b4b"
        }">${data.comparison.hygieneCompletionPercentDelta > 0 ? "▲" : "▼"} ${Math.abs(
          data.comparison.hygieneCompletionPercentDelta
        )} pts</span>`
      : ""
  }</p>
      <p class="hero-label">${t("pdf.hygieneCompliance")}</p>

      <table>
        <tr><td class="module">${t("pdf.wellness")}</td><td style="text-align:right">${t("pdf.wellnessValue", {
    sleep: formatSleep(data.bienestar.avgSleepMinutes),
    meals: String(data.bienestar.mealsCount),
    exercise: String(data.bienestar.exerciseCount),
  })}</td></tr>
        <tr><td class="module">${t("pdf.hygiene")}</td><td style="text-align:right">${t("pdf.hygieneValue", {
    percent: String(data.higiene.completionPercent),
  })}</td></tr>
        <tr><td class="module">${t("pdf.hair")}</td><td style="text-align:right">${t("pdf.hairValue", {
    washes: String(data.pelo.washCount),
    styles: String(data.pelo.distinctHairstylesCount),
  })}</td></tr>
        <tr><td class="module">${t("pdf.face")}</td><td style="text-align:right">${t("pdf.faceValue", {
    days: String(data.cara.makeupDays),
  })}</td></tr>
        <tr><td class="module">${t("pdf.image")}</td><td style="text-align:right">${t("pdf.imageValue", {
    outfits: String(data.imagen.outfitsCount),
  })}</td></tr>
        <tr><td class="module">${t("pdf.social")}</td><td style="text-align:right">${t("pdf.socialValue", {
    count: String(data.social.activitiesCount),
    types: socialTypes,
  })}${data.social.avgFeelingLabel ? t("pdf.socialAvgFeeling", { feeling: data.social.avgFeelingLabel }) : ""}</td></tr>
      </table>

      <table>
        <tr><td class="module">${t("pdf.expensesTotal")}</td><td style="text-align:right">${formatMoney(
    data.gastos.total,
    lang
  )}</td></tr>
        ${gastosBreakdown}
      </table>

      <footer>${t("pdf.generatedIn")}</footer>
    </body>
  </html>`;
}

export async function generateAndSharePdf(data: ResumenData, period: ResumenPeriod, lang: Language) {
  const { uri } = await Print.printToFileAsync({ html: buildResumenHtml(data, period, lang) });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf" });
  }
  return uri;
}
