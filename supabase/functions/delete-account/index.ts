// Edge Function: delete-account
//
// Borra la cuenta del usuario autenticado de forma permanente. Solo se
// puede llamar con el JWT del propio usuario (no recibe ni acepta ningún
// id externo) — así nadie puede borrar la cuenta de otra persona, ni
// siquiera con la publishable key.
//
// Borrar el usuario en auth.users dispara el "on delete cascade" de todas
// las tablas de la app (profiles, y todo lo que cuelga de profiles.id o de
// user_id) — ver supabase/migrations/0001_init.sql. No hace falta borrar
// nada a mano acá.

import { corsHeaders } from "../_shared/cors.ts";
import { getServiceClient, getUserFromAuthHeader } from "../_shared/rateLimit.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const serviceClient = getServiceClient();
    const user = await getUserFromAuthHeader(req, serviceClient);
    if (!user) {
      return json({ error: "No autorizado" }, 401);
    }

    const { error } = await serviceClient.auth.admin.deleteUser(user.id);
    if (error) {
      console.error("No se pudo borrar la cuenta", error);
      return json({ error: "No se pudo borrar la cuenta" }, 500);
    }

    return json({ ok: true });
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
