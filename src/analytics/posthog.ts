import PostHog from "posthog-react-native";
import { env } from "@/config/env";

// Cliente de analytics centralizado. Placeholder configurable: si no hay
// API key seteada, todos los métodos son no-op para que el resto del
// código pueda llamar analytics.track(...) sin preocuparse por el entorno.
let client: PostHog | null = null;

export async function initAnalytics() {
  if (!env.posthogApiKey) {
    console.warn("PostHog API key no configurada, analytics en modo no-op.");
    return;
  }
  client = new PostHog(env.posthogApiKey, { host: env.posthogHost });
}

export const analytics = {
  track(event: string, properties?: Record<string, unknown>) {
    // PostHog tipa sus props como JSON estricto; nuestros call sites pasan
    // valores JS comunes (string | number | boolean | undefined) que son
    // serializables igual, así que el cast acá es seguro.
    client?.capture(event, properties as Record<string, string | number | boolean | null>);
  },
  identify(userId: string, properties?: Record<string, unknown>) {
    client?.identify(userId, properties as Record<string, string | number | boolean | null>);
  },
  reset() {
    client?.reset();
  },
};
