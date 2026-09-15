import { supabase } from "@/lib/supabase";

// Llama a la Edge Function delete-account, que borra al usuario de
// auth.users con la service role — eso dispara el "on delete cascade" de
// todas las tablas de la app (ver supabase/migrations/0001_init.sql), así
// que no hace falta borrar nada más a mano acá ni del lado del cliente.
export async function deleteAccount(): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  const { error } = await supabase.functions.invoke("delete-account", {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });
  if (error) throw error;
}
