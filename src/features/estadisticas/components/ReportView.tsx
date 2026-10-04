import React from "react";
import { Text, View } from "react-native";
import { format, parseISO } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { Card } from "@/components/ui/Card";
import { StarRating } from "@/components/ui/StarRating";
import { translateHygieneLabel } from "@/features/higiene/labelTranslation";
import type { Count, Highlight, Report, WardrobeStats } from "@/features/estadisticas/logic/aggregate";
import type { ReportKind } from "@/features/estadisticas/logic/periods";
import { useT, type TranslationKey } from "@/lib/i18n";

// Vista funcional del informe (sin estilos finales todavía): muestra los
// datos por módulo. Las animaciones y el diseño se agregan después.

type T = ReturnType<typeof useT>["t"];

function Delta({ count, previous }: { count: number; previous: number | null }) {
  if (previous === null) return null;
  const diff = count - previous;
  const text = diff === 0 ? "=" : diff > 0 ? `+${diff}` : `−${Math.abs(diff)}`;
  const color = diff === 0 ? "#9ca3af" : diff > 0 ? "#16a34a" : "#dc2626";
  return <Text style={{ color, fontSize: 12, marginLeft: 6 }}>{text}</Text>;
}

function Row({ label, count, previous = null }: { label: string; count: number | string; previous?: number | null }) {
  return (
    <View className="flex-row items-center justify-between py-1">
      <Text className="text-sm text-surface-dark dark:text-white flex-1 mr-2">{label}</Text>
      <View className="flex-row items-center">
        <Text className="text-sm font-semibold text-surface-dark dark:text-white">{count}</Text>
        {typeof count === "number" ? <Delta count={count} previous={previous} /> : null}
      </View>
    </View>
  );
}

function Subtitle({ children }: { children: string }) {
  return <Text className="text-xs font-semibold text-gray-500 mt-3 mb-1 uppercase">{children}</Text>;
}

function Empty({ t }: { t: T }) {
  return <Text className="text-sm text-gray-400">{t("stats.none")}</Text>;
}

function CountList({ items, labelOf, t }: { items: Count[]; labelOf: (c: Count) => string; t: T }) {
  const visible = items.filter((c) => c.count > 0 || (c.previous ?? 0) > 0);
  if (visible.length === 0) return <Empty t={t} />;
  return (
    <>
      {visible.map((c) => (
        <Row key={c.key} label={labelOf(c)} count={c.count} previous={c.previous} />
      ))}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="mb-4">
      <Text className="text-base font-bold text-surface-dark dark:text-white mb-1">{title}</Text>
      {children}
    </Card>
  );
}

function Wardrobe({ title, stats, t }: { title: string; stats: WardrobeStats; t: T }) {
  return (
    <>
      <Subtitle>{title}</Subtitle>
      <Row label={t("stats.wardrobe.total")} count={stats.total} />
      <Row label={t("stats.wardrobe.new")} count={stats.newCount} />
      {stats.topColor ? (
        <Row
          label={t("stats.wardrobe.topColor")}
          count={`${t(`stats.color.${stats.topColor.color}` as TranslationKey)} ×${stats.topColor.count}`}
        />
      ) : null}
      {stats.repeats.length > 0 ? (
        <>
          <Text className="text-xs text-gray-500 mt-1">{t("stats.wardrobe.repeats")}</Text>
          {stats.repeats.slice(0, 5).map((r) => (
            <Row key={r.label} label={r.label} count={`×${r.count}`} />
          ))}
        </>
      ) : null}
    </>
  );
}

function highlightText(h: Highlight, kind: ReportKind, isCurrent: boolean, t: T, dateLabel: (d: string) => string) {
  const when = t(`stats.${isCurrent || kind === "day" ? "this" : "that"}.${kind}` as TranslationKey);
  const prev = kind === "day" ? "" : t(`stats.prev.${kind}` as TranslationKey);
  switch (h.type) {
    case "moodChange":
      return t(h.diff > 0 ? "stats.hl.moodMore" : "stats.hl.moodLess", {
        when,
        prev,
        mood: t(`bienestar.mood.${h.mood}` as TranslationKey),
        n: String(Math.abs(h.diff)),
      });
    case "topExercise":
      return t("stats.hl.topExercise", { label: h.label, n: String(h.count) });
    case "outfitColor":
      return t("stats.hl.outfitColor", { when, color: t(`stats.color.${h.color}` as TranslationKey) });
    case "favoriteOutfit":
      return t("stats.hl.favoriteOutfit", { label: h.label, n: String(h.count) });
    case "socialChange":
      return t(h.diff > 0 ? "stats.hl.socialMore" : "stats.hl.socialLess", { n: String(Math.abs(h.diff)), prev });
    case "busiestWeek":
      return t("stats.hl.busiestWeek", { date: dateLabel(h.from), n: String(h.count) });
    case "topTaste":
      return t("stats.hl.topTaste", { name: h.name });
  }
}

export function ReportView({ report, isCurrent }: { report: Report; isCurrent: boolean }) {
  const { t, lang } = useT();
  const locale = lang === "en" ? enUS : es;
  const dateLabel = (d: string) => format(parseISO(d), "d MMM", { locale });
  const kind = report.period.kind;
  const { bienestar, imagen, higiene, social, gastos, gustos, notas } = report;

  return (
    <View>
      {report.hasComparison ? (
        <Text className="text-xs text-gray-500 mb-3">
          {t(`stats.comparedWith.${kind}` as TranslationKey)}
        </Text>
      ) : null}

      {report.highlights.length > 0 ? (
        <Section title={t("stats.highlights")}>
          {report.highlights.map((h, i) => (
            <Text key={i} className="text-sm text-surface-dark dark:text-white py-1">
              ✨ {highlightText(h, kind, isCurrent, t, dateLabel)}
            </Text>
          ))}
        </Section>
      ) : null}

      <Section title={t("stats.section.bienestar")}>
        <Subtitle>{t("stats.moods")}</Subtitle>
        <CountList items={bienestar.moods} labelOf={(c) => t(`bienestar.mood.${c.key}` as TranslationKey)} t={t} />
        <Subtitle>{t("stats.meals")}</Subtitle>
        <CountList items={bienestar.meals} labelOf={(c) => t(`bienestar.meal.${c.key}` as TranslationKey)} t={t} />
        <Subtitle>{t("stats.exercises")}</Subtitle>
        <CountList items={bienestar.exercises} labelOf={(c) => c.label} t={t} />
      </Section>

      <Section title={t("stats.section.imagen")}>
        <Row label={t("stats.makeupDays")} count={imagen.makeupDays.count} previous={imagen.makeupDays.previous} />
        <Row label={t("stats.hairstylesNew")} count={imagen.hairstylesNew} />
        {imagen.hairstyleRepeats.length > 0 ? (
          <>
            <Subtitle>{t("stats.hairstyleRepeats")}</Subtitle>
            {imagen.hairstyleRepeats.slice(0, 5).map((r) => (
              <Row key={r.label} label={r.label} count={`×${r.count}`} />
            ))}
          </>
        ) : null}
        <Subtitle>{t("stats.faceProductsNew")}</Subtitle>
        <CountList
          items={imagen.faceProductsNew}
          labelOf={(c) => t(`stats.product.${c.key}` as TranslationKey)}
          t={t}
        />
        <Wardrobe title={t("stats.outfits")} stats={imagen.outfits} t={t} />
        <Wardrobe title={t("stats.shoes")} stats={imagen.shoes} t={t} />
      </Section>

      <Section title={t("stats.section.higiene")}>
        {higiene.length === 0 ? (
          <Empty t={t} />
        ) : (
          higiene.map((c) => (
            <Row key={c.key} label={translateHygieneLabel(t, c.label)} count={c.count} previous={c.previous} />
          ))
        )}
      </Section>

      <Section title={t("stats.section.social")}>
        <Row label={t("stats.socialTotal")} count={social.total.count} previous={social.total.previous} />
        <CountList items={social.byType} labelOf={(c) => t(`social.type.${c.key}` as TranslationKey)} t={t} />
        {social.busiestWeek ? (
          <Row
            label={t("stats.busiestWeek")}
            count={`${t("stats.weekOf", { date: dateLabel(social.busiestWeek.from) })} (${social.busiestWeek.count})`}
          />
        ) : null}
      </Section>

      <Section title={t("stats.section.gastos")}>
        <Row label={t("stats.extras")} count={gastos.extras.count} previous={gastos.extras.previous} />
      </Section>

      <Section title={t("stats.section.gustos")}>
        {gustos.length === 0 ? (
          <Empty t={t} />
        ) : (
          gustos.slice(0, 15).map((g, i) => (
            <View key={`${g.name}-${i}`} className="flex-row items-center justify-between py-1">
              <View className="flex-1 mr-2">
                <Text className="text-sm text-surface-dark dark:text-white">{g.name}</Text>
                <Text className="text-xs text-gray-400">
                  {g.category === "rapido"
                    ? t("stats.taste.rapido")
                    : t(`gustos.category.${g.category}` as TranslationKey)}
                </Text>
              </View>
              {g.rating ? <StarRating value={g.rating} size={14} /> : null}
            </View>
          ))
        )}
      </Section>

      <Section title={t("stats.section.notas")}>
        <Row label={t("stats.notesShort")} count={notas.short.count} previous={notas.short.previous} />
        <Row label={t("stats.notesLong")} count={notas.long.count} previous={notas.long.previous} />
      </Section>
    </View>
  );
}
