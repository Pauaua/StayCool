import Constants from "expo-constants";

// Estas dos vienen de app.config.js -> extra, que a su vez las lee de
// NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en .env
// (no usan el prefijo EXPO_PUBLIC_, por eso pasan por `extra` + expo-constants
// en vez de por process.env directo).
const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. Copia .env.example a .env y complétala.`
    );
  }
  return value;
}

export const env = {
  supabaseUrl: requireEnv("NEXT_PUBLIC_SUPABASE_URL", extra.supabaseUrl),
  supabasePublishableKey: requireEnv(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    extra.supabasePublishableKey
  ),
  sentryDsn: extra.sentryDsn ?? "",
  posthogApiKey: extra.posthogApiKey ?? "",
  posthogHost: extra.posthogHost ?? "https://app.posthog.com",
  revenueCatApiKeyIos: extra.revenueCatApiKeyIos ?? "",
  revenueCatApiKeyAndroid: extra.revenueCatApiKeyAndroid ?? "",
  facebookAppId: extra.facebookAppId ?? "",
};
