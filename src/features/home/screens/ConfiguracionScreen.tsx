import React, { useState } from "react";
import { Image, Modal, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { useProfile, useUpdateProfile } from "@/features/home/hooks/useProfile";
import { useGoToWelcome } from "@/navigation/WelcomeNavigationContext";
import { useHideRailWhileMounted } from "@/navigation/RailVisibilityContext";
import { FallingCircles } from "@/components/ui/FallingCircles";
import { useT } from "@/lib/i18n";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<HomeStackParamList, "Configuracion">;

// Azul profundo predominante, mezclado con el celeste y el resto de la paleta.
const CONFIG_CIRCLE_COLORS = ["#002054", "#002054", "#002054", "#d9ebff", "#d9ebff", "#ecc6ff", "#ebfff7"];

const LANGUAGES: { value: "es" | "en" }[] = [{ value: "es" }, { value: "en" }];

const PRONOUNS: { value: "masculino" | "femenino" | "no_binarie" | "no_se" }[] = [
  { value: "masculino" },
  { value: "femenino" },
  { value: "no_binarie" },
  { value: "no_se" },
];

const PRONOUN_KEY = {
  masculino: "config.pronoun.masculino",
  femenino: "config.pronoun.femenino",
  no_binarie: "config.pronoun.noBinarie",
  no_se: "config.pronoun.noSe",
} as const;

export function ConfiguracionScreen({ navigation }: Props) {
  const goToWelcome = useGoToWelcome();
  useHideRailWhileMounted();
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const { t, tg } = useT();
  // Si ya hay una fecha guardada, partimos asumiendo que fue la exacta;
  // si no, arrancamos en "no sé" para no forzar a nadie a tipear una fecha
  // que no tiene. Es solo para elegir qué texto mostrar, el dato que se
  // guarda (last_period_date) es el mismo en ambos casos.
  const [knowsExactDate, setKnowsExactDate] = useState(true);
  const [showDay1Calendar, setShowDay1Calendar] = useState(false);

  return (
    <SafeAreaView className="flex-1 px-5 pt-4" style={{ backgroundColor: "#eef4ff" }}>
      <FallingCircles colors={CONFIG_CIRCLE_COLORS} />
      <Pressable onPress={goToWelcome} className="flex-row items-center mb-3" hitSlop={8}>
        <Text className="text-xl" style={{ color: "#002054" }}>‹</Text>
        <Text className="text-sm ml-1" style={{ color: "#002054" }}>{t("config.back")}</Text>
      </Pressable>

      <View className="flex-row items-center mb-4">
        <View
          style={{ width: 8, height: 24, borderRadius: 4, backgroundColor: "#002054", marginRight: 8 }}
        />
        <Image
          source={require("../../../../assets/images/tuerca.png")}
          style={{ width: 28, height: 28, marginRight: 8 }}
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold text-surface-dark dark:text-white">{t("config.title")}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <Card style={{ borderLeftWidth: 4, borderLeftColor: "#002054" }}>
        <Text className="text-base font-bold text-surface-dark dark:text-white mb-1">
          {t("config.language.title")}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {t("config.language.subtitle")}
        </Text>

        <View className="gap-2">
          {LANGUAGES.map((lang) => {
            const selected = profile?.language === lang.value;
            return (
              <Pressable
                key={lang.value}
                onPress={() => update.mutate({ language: lang.value })}
                className={`flex-row items-center justify-between rounded-card px-4 py-3 border ${
                  selected ? "" : "bg-white dark:bg-surface-cardDark border-gray-200 dark:border-gray-700"
                }`}
                style={selected ? { backgroundColor: "#d9ebff", borderColor: "#002054" } : undefined}
              >
                <Text
                  className={selected ? "font-semibold" : "text-surface-dark dark:text-white"}
                  style={selected ? { color: "#002054" } : undefined}
                >
                  {t(lang.value === "es" ? "config.language.es" : "config.language.en")}
                </Text>
                {selected ? <Text style={{ color: "#002054" }}>✓</Text> : null}
              </Pressable>
            );
          })}
        </View>

        <Text className="text-xs text-gray-400 mt-3">
          {profile?.language === "en" ? t("config.language.noteEn") : t("config.language.noteEs")}
        </Text>
      </Card>

      <Card className="mt-4 mb-4" style={{ borderLeftWidth: 4, borderLeftColor: "#d9ebff" }}>
        <Text className="text-base font-bold text-surface-dark dark:text-white mb-1">
          {t("config.socialName.title")}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {t("config.socialName.subtitle")}
        </Text>
        <TextField
          label={t("config.socialName.label")}
          defaultValue={profile?.display_name ?? ""}
          onEndEditing={(e) => update.mutate({ display_name: e.nativeEvent.text.trim() })}
        />
      </Card>

      <Card style={{ borderLeftWidth: 4, borderLeftColor: "#002054" }}>
        <Text className="text-base font-bold text-surface-dark dark:text-white mb-1">
          {t("config.pronoun.title")}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {t("config.pronoun.subtitle")}
        </Text>

        <View className="gap-2">
          {PRONOUNS.map((option) => {
            const selected = profile?.pronoun === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => update.mutate({ pronoun: option.value })}
                className={`flex-row items-center justify-between rounded-card px-4 py-3 border ${
                  selected ? "" : "bg-white dark:bg-surface-cardDark border-gray-200 dark:border-gray-700"
                }`}
                style={selected ? { backgroundColor: "#d9ebff", borderColor: "#002054" } : undefined}
              >
                <Text
                  className={selected ? "font-semibold" : "text-surface-dark dark:text-white"}
                  style={selected ? { color: "#002054" } : undefined}
                >
                  {t(PRONOUN_KEY[option.value])}
                </Text>
                {selected ? <Text style={{ color: "#002054" }}>✓</Text> : null}
              </Pressable>
            );
          })}
        </View>

        <Text className="text-xs text-gray-400 mt-3">{t("config.pronoun.note")}</Text>
      </Card>

      <Card className="mt-4" style={{ borderLeftWidth: 4, borderLeftColor: "#ecc6ff" }}>
        <Text className="text-base font-bold text-surface-dark dark:text-white mb-1">
          {t("config.period.title")}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {t("config.period.subtitle")}
        </Text>

        <View className="flex-row gap-2 mb-3">
          {[true, false].map((value) => {
            const selected = profile?.is_menstruating === value;
            return (
              <Pressable
                key={String(value)}
                onPress={() => update.mutate({ is_menstruating: value })}
                className={`flex-1 items-center rounded-card px-4 py-3 border ${
                  selected ? "" : "bg-white dark:bg-surface-cardDark border-gray-200 dark:border-gray-700"
                }`}
                style={selected ? { backgroundColor: "#ecc6ff", borderColor: "#002054" } : undefined}
              >
                <Text
                  className={selected ? "font-semibold" : "text-surface-dark dark:text-white"}
                  style={selected ? { color: "#002054" } : undefined}
                >
                  {value ? t("config.period.yes") : t("config.period.no")}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {profile?.is_menstruating ? (
          <View>
            <View className="flex-row gap-2 mb-3">
              {[true, false].map((value) => {
                const selected = knowsExactDate === value;
                return (
                  <Pressable
                    key={String(value)}
                    onPress={() => setKnowsExactDate(value)}
                    className={`flex-1 items-center rounded-card px-3 py-2 border ${
                      selected ? "" : "bg-white dark:bg-surface-cardDark border-gray-200 dark:border-gray-700"
                    }`}
                    style={selected ? { backgroundColor: "#d9ebff", borderColor: "#002054" } : undefined}
                  >
                    <Text
                      className={`text-xs ${selected ? "font-semibold" : "text-surface-dark dark:text-white"}`}
                      style={selected ? { color: "#002054" } : undefined}
                    >
                      {value ? t("config.period.knowsExact") : tg("config.period.approximate")}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-1.5">
              {knowsExactDate ? t("config.period.day1Label") : t("config.period.day1ApproxLabel")}
            </Text>
            <Pressable
              onPress={() => setShowDay1Calendar(true)}
              className="rounded-card px-4 py-3 border bg-white dark:bg-surface-cardDark border-gray-200 dark:border-gray-700 mb-3"
            >
              <Text className={profile.last_period_date ? "text-surface-dark dark:text-white" : "text-gray-400"}>
                {profile.last_period_date
                  ? format(new Date(`${profile.last_period_date}T00:00:00`), "dd MMMM yyyy")
                  : t("config.period.pickDate")}
              </Text>
            </Pressable>

            <Modal
              visible={showDay1Calendar}
              transparent
              animationType="fade"
              onRequestClose={() => setShowDay1Calendar(false)}
            >
              <View className="flex-1 items-center justify-center bg-black/40 px-6">
                <Card className="w-full">
                  <Calendar
                    current={profile.last_period_date ?? format(new Date(), "yyyy-MM-dd")}
                    maxDate={format(new Date(), "yyyy-MM-dd")}
                    onDayPress={(day) => {
                      update.mutate({ last_period_date: day.dateString });
                      setShowDay1Calendar(false);
                    }}
                    markedDates={
                      profile.last_period_date
                        ? { [profile.last_period_date]: { selected: true, selectedColor: "#002054" } }
                        : {}
                    }
                    theme={{ arrowColor: "#002054", todayTextColor: "#002054" }}
                  />
                  <Pressable onPress={() => setShowDay1Calendar(false)} className="mt-2 items-center py-2">
                    <Text style={{ color: "#002054" }}>{t("config.period.closeCalendar")}</Text>
                  </Pressable>
                </Card>
              </View>
            </Modal>

            <TextField
              label={t("config.period.cycleLengthLabel")}
              placeholder="28"
              keyboardType="numeric"
              defaultValue={String(profile.cycle_length_days ?? 28)}
              onEndEditing={(e) => {
                const days = Number(e.nativeEvent.text.trim());
                if (Number.isFinite(days) && days >= 15 && days <= 45) {
                  update.mutate({ cycle_length_days: days });
                }
              }}
            />

            <TextField
              label={t("config.period.daysBeforeLabel")}
              placeholder="3"
              keyboardType="numeric"
              defaultValue={String(profile.period_reminder_days_before ?? 3)}
              onEndEditing={(e) => {
                const days = Number(e.nativeEvent.text.trim());
                if (Number.isFinite(days) && days >= 0 && days <= 14) {
                  update.mutate({ period_reminder_days_before: days });
                }
              }}
            />

            <TextField
              label={t("config.period.messageLabel")}
              placeholder="Se aproxima desprendimiento de endometrio, ¡Prepárate!"
              defaultValue={profile.period_reminder_message ?? ""}
              multiline
              onEndEditing={(e) => {
                const value = e.nativeEvent.text.trim();
                update.mutate({ period_reminder_message: value || null });
              }}
            />

            <Text className="text-xs text-gray-400 mt-3">{t("config.period.note")}</Text>
          </View>
        ) : null}
      </Card>

      <Pressable
        onPress={() => navigation.navigate("Legal")}
        className="mt-4 rounded-card px-4 py-3 border bg-white dark:bg-surface-cardDark border-gray-200 dark:border-gray-700"
      >
        <Text className="text-sm font-semibold" style={{ color: "#002054" }}>
          {t("config.legal.link")}
        </Text>
      </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
