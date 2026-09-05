import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type { ResumenData, ResumenPeriod } from "@/features/resumen/types";

const PERIOD_LABEL: Record<ResumenPeriod, string> = {
  weekly: "Semanal",
  monthly: "Mensual",
  yearly: "Anual",
};

function formatSleep(minutes: number) {
  if (minutes <= 0) return "—";
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
}

function formatMoney(amount: number) {
  return `$${amount.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
}

// Mismo dataset que consumen el dashboard y la tarjeta compartible — un solo
// template HTML, renderizado a PDF con expo-print, para que las tres vistas
// nunca queden desincronizadas entre sí.
function buildResumenHtml(data: ResumenData, period: ResumenPeriod): string {
  const socialTypes = Object.entries(data.social.typeBreakdown)
    .map(([type, count]) => `${type} (${count})`)
    .join(", ") || "—";
  const gastosBreakdown = Object.entries(data.gastos.breakdown)
    .map(([kind, amount]) => `<tr><td>${kind}</td><td style="text-align:right">${formatMoney(amount)}</td></tr>`)
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
      <h1>Mi Resumen — Agenda Cool+</h1>
      <div class="period">${PERIOD_LABEL[period]} · ${data.from} a ${data.to}</div>

      <p class="hero">${data.higiene.completionPercent}%${
    data.comparison.hygieneCompletionPercentDelta !== 0
      ? ` <span style="font-size:14px;color:${
          data.comparison.hygieneCompletionPercentDelta > 0 ? "#14a893" : "#e04b4b"
        }">${data.comparison.hygieneCompletionPercentDelta > 0 ? "▲" : "▼"} ${Math.abs(
          data.comparison.hygieneCompletionPercentDelta
        )} pts</span>`
      : ""
  }</p>
      <p class="hero-label">cumplimiento del checklist de Higiene vs. período anterior</p>

      <table>
        <tr><td class="module">Bienestar</td><td style="text-align:right">${formatSleep(
          data.bienestar.avgSleepMinutes
        )} sueño promedio · ${data.bienestar.mealsCount} comidas · ${data.bienestar.exerciseCount} sesiones de ejercicio</td></tr>
        <tr><td class="module">Higiene</td><td style="text-align:right">${data.higiene.completionPercent}% cumplido</td></tr>
        <tr><td class="module">Pelo</td><td style="text-align:right">${data.pelo.washCount} lavados · ${data.pelo.distinctHairstylesCount} peinados distintos</td></tr>
        <tr><td class="module">Cara</td><td style="text-align:right">${data.cara.makeupDays} días maquillada</td></tr>
        <tr><td class="module">Imagen</td><td style="text-align:right">${data.imagen.outfitsCount} outfits registrados</td></tr>
        <tr><td class="module">Social</td><td style="text-align:right">${data.social.activitiesCount} salidas (${socialTypes})${
    data.social.avgFeelingLabel ? ` · sensación promedio: ${data.social.avgFeelingLabel}` : ""
  }</td></tr>
      </table>

      <table>
        <tr><td class="module">Gastos — total</td><td style="text-align:right">${formatMoney(data.gastos.total)}</td></tr>
        ${gastosBreakdown}
      </table>

      <footer>Generado en Agenda Cool+</footer>
    </body>
  </html>`;
}

export async function generateAndSharePdf(data: ResumenData, period: ResumenPeriod) {
  const { uri } = await Print.printToFileAsync({ html: buildResumenHtml(data, period) });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf" });
  }
  return uri;
}
