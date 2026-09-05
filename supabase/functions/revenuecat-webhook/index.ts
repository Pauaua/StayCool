// Edge Function: revenuecat-webhook
//
// RevenueCat llama a esta función cada vez que cambia una suscripción
// (compra, renovación, cancelación, expiración, etc). En vez de confiar en
// el cuerpo del evento para decidir el tier, volvemos a pedirle a la API de
// RevenueCat el estado actual del subscriber — así el resultado siempre
// refleja la verdad vigente sin importar el orden de llegada de eventos.
//
// Configuración en el dashboard de RevenueCat (Project settings > Webhooks):
//   URL: https://<project-ref>.supabase.co/functions/v1/revenuecat-webhook
//   Authorization header value: el mismo string que REVENUECAT_WEBHOOK_SECRET
//
// Secrets requeridos (supabase secrets set ...):
//   REVENUECAT_WEBHOOK_SECRET   -> valor arbitrario que también se pega en RevenueCat
//   REVENUECAT_SECRET_API_KEY   -> API key secreta (server-side) del proyecto en RevenueCat

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { corsHeaders } from "../_shared/cors.ts";

const ENTITLEMENT_BASICO = "basico";
const ENTITLEMENT_FULL = "full";

interface RevenueCatSubscriberResponse {
  subscriber?: {
    entitlements?: Record<string, { expires_date: string | null }>;
  };
}

function resolveTier(entitlements: Record<string, { expires_date: string | null }> | undefined): string {
  if (!entitlements) return "free";
  const isActive = (id: string) => {
    const ent = entitlements[id];
    if (!ent) return false;
    if (!ent.expires_date) return true; // suscripción no-expirable (lifetime)
    return new Date(ent.expires_date).getTime() > Date.now();
  };
  if (isActive(ENTITLEMENT_FULL)) return "full";
  if (isActive(ENTITLEMENT_BASICO)) return "basico";
  return "free";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const webhookSecret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!webhookSecret || authHeader !== `Bearer ${webhookSecret}`) {
    return json({ error: "No autorizado" }, 401);
  }

  try {
    const payload = await req.json();
    const appUserId: string | undefined = payload?.event?.app_user_id;
    if (!appUserId) {
      return json({ error: "app_user_id ausente en el evento" }, 400);
    }

    const rcApiKey = Deno.env.get("REVENUECAT_SECRET_API_KEY");
    if (!rcApiKey) {
      console.error("REVENUECAT_SECRET_API_KEY no configurada");
      return json({ error: "Config del servidor incompleta" }, 500);
    }

    const subscriberRes = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`,
      { headers: { Authorization: `Bearer ${rcApiKey}` } }
    );
    if (!subscriberRes.ok) {
      console.error("RevenueCat subscriber fetch falló", subscriberRes.status, await subscriberRes.text());
      return json({ error: "No se pudo consultar RevenueCat" }, 502);
    }

    const subscriberData = (await subscriberRes.json()) as RevenueCatSubscriberResponse;
    const tier = resolveTier(subscriberData.subscriber?.entitlements);

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // app_user_id se configura como el id de usuario de Supabase (ver
    // identifyRevenueCatUser -> Purchases.logIn), así que coincide 1:1 con
    // profiles.id.
    const { error } = await serviceClient
      .from("profiles")
      .update({ premium_tier: tier })
      .eq("id", appUserId);

    if (error) {
      console.error("No se pudo actualizar premium_tier", error);
      return json({ error: "Error interno" }, 500);
    }

    return json({ ok: true, appUserId, tier });
  } catch (error) {
    console.error(error);
    return json({ error: "Error interno" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
