require("dotenv/config");

// app.config.js corre en Node (no en el bundle de RN), así que puede leer
// cualquier variable de entorno sin importar su prefijo. Las exponemos acá
// vía `extra` para poder usar exactamente NEXT_PUBLIC_SUPABASE_URL y
// NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (en vez del prefijo EXPO_PUBLIC_ que
// Expo inlinea automáticamente) y leerlas en runtime con expo-constants.
module.exports = {
  expo: {
    name: "Agenda Cool",
    slug: "coolthings",
    owner: "coolthingss-team",
    scheme: "agendacool",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#121016",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.agendacool.app",
      // Requerido por react-native-share para poder chequear/abrir estas
      // apps desde el selector propio de "Mi Resumen" (Instagram, WhatsApp,
      // X, Facebook). Sin esto, iOS 9+ bloquea silenciosamente los canOpenURL.
      infoPlist: {
        LSApplicationQueriesSchemes: [
          "instagram",
          "instagram-stories",
          "whatsapp",
          "twitter",
          "fb",
          "fb-messenger-share-api",
          "tiktoksharesdk",
        ],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#121016",
      },
      package: "com.agendacool.app",
    },
    plugins: [
      "expo-secure-store",
      "expo-font",
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#b825f2",
        },
      ],
      [
        "@sentry/react-native/expo",
        {
          organization: "your-org",
          project: "agenda-cool",
        },
      ],
    ],
    extra: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? "",
      posthogApiKey: process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? "",
      posthogHost: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
      revenueCatApiKeyIos: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS ?? "",
      revenueCatApiKeyAndroid: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID ?? "",
      facebookAppId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID ?? "",
      eas: {
        projectId: "d9f76765-219d-46aa-a30b-58b78c10e996",
      },
    },
    updates: {
      url: "https://u.expo.dev/d9f76765-219d-46aa-a30b-58b78c10e996",
    },
    runtimeVersion: {
      policy: "appVersion",
    },
  },
};
