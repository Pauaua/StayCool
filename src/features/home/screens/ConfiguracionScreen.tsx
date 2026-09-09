import React from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { useProfile, useUpdateProfile } from "@/features/home/hooks/useProfile";
import { useGoToWelcome } from "@/navigation/WelcomeNavigationContext";
import { useHideRailWhileMounted } from "@/navigation/RailVisibilityContext";
import { FallingCircles } from "@/components/ui/FallingCircles";
import { useT } from "@/lib/i18n";

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

export function ConfiguracionScreen() {
  const goToWelcome = useGoToWelcome();
  useHideRailWhileMounted();
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const { t } = useT();

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
      </ScrollView>
    </SafeAreaView>
  );
}
