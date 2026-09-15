// expo-file-system v19+ reemplazó readAsStringAsync/EncodingType por una API
// basada en clases File/Directory; "expo-file-system/legacy" mantiene la API
// anterior tal cual, que es la que usamos acá (mismo patrón que imagenService).
import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/features/home/types";

export async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) throw error;
  return data as Profile;
}

export async function updateProfile(userId: string, patch: Partial<Profile>) {
  const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
  if (error) throw error;
}

// Activa la prueba gratuita de 3 días del plan Full. Todo el trabajo (que
// no se pueda reclamar dos veces, que quede marcada) pasa por la función
// claim_trial() en Postgres — ver supabase/migrations/0025_trial.sql.
export async function claimTrial(): Promise<string> {
  const { data, error } = await supabase.rpc("claim_trial");
  if (error) throw error;
  return data as string;
}

// Avatar fijo (free/básico): foto subida al bucket privado 'avatars' bajo
// <user_id>/avatar.jpg, mismo patrón que outfits/hairstyles.
export async function uploadAvatarPhoto(userId: string, localImageUri: string) {
  const base64 = await FileSystem.readAsStringAsync(localImageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const avatarPath = `${userId}/avatar.jpg`;
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(avatarPath, decode(base64), { upsert: true, contentType: "image/jpeg" });
  if (uploadError) throw uploadError;

  const { error } = await supabase.from("profiles").update({ avatar_url: avatarPath }).eq("id", userId);
  if (error) throw error;
}

export async function getAvatarPhotoUrl(avatarPath: string): Promise<string> {
  const { data, error } = await supabase.storage.from("avatars").createSignedUrl(avatarPath, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}
