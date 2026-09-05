import * as Sentry from "@sentry/react-native";
import { env } from "@/config/env";

export function initSentry() {
  if (!env.sentryDsn) {
    console.warn("Sentry DSN no configurado, se omite inicialización.");
    return;
  }
  Sentry.init({
    dsn: env.sentryDsn,
    tracesSampleRate: 0.2,
    enableAutoSessionTracking: true,
  });
}

export { Sentry };
