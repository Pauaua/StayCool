import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import type { HairProfile, HairstyleLog, HairstyleType, HairWashLog } from "@/features/pelo/types";

const PAGE_SIZE = 20;

// Sube la foto al bucket privado 'hairstyles' bajo <user_id>/<timestamp>.jpg
// (mismo patrón que outfit_logs/bucket 'outfits' en Imagen) y guarda el
// registro con el path — la URL firmada se resuelve al mostrarla.
export async function logHairstyle(
  userId: string,
  hairstyle: string,
  localImageUri?: string,
  details?: {
    styleType?: HairstyleType;
    isSpecialOccasion?: boolean;
    occasionDetails?: string;
  }
) {
  let photoPath: string | null = null;

  if (localImageUri) {
    const base64 = await FileSystem.readAsStringAsync(localImageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    photoPath = `${userId}/${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("hairstyles")
      .upload(photoPath, decode(base64), { contentType: "image/jpeg" });
    if (uploadError) throw uploadError;
  }

  const { error } = await supabase.from("hairstyle_logs").insert({
    user_id: userId,
    hairstyle,
    photo_path: photoPath,
    style_type: details?.styleType ?? null,
    is_special_occasion: details?.isSpecialOccasion ?? false,
    occasion_details: details?.isSpecialOccasion ? details?.occasionDetails ?? null : null,
  });
  if (error) throw error;
}

export async function updateHairstyleLog(
  id: string,
  userId: string,
  hairstyle: string,
  localImageUri: string | undefined,
  details: {
    styleType?: HairstyleType;
    isSpecialOccasion?: boolean;
    occasionDetails?: string;
  }
) {
  let photoPath: string | undefined;
  if (localImageUri) {
    const base64 = await FileSystem.readAsStringAsync(localImageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    photoPath = `${userId}/${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("hairstyles")
      .upload(photoPath, decode(base64), { contentType: "image/jpeg" });
    if (uploadError) throw uploadError;
  }
  const { error } = await supabase
    .from("hairstyle_logs")
    .update({
      hairstyle,
      style_type: details.styleType ?? null,
      is_special_occasion: details.isSpecialOccasion ?? false,
      occasion_details: details.isSpecialOccasion ? details.occasionDetails ?? null : null,
      ...(photoPath ? { photo_path: photoPath } : {}),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteHairstyleLog(id: string) {
  const { error } = await supabase.from("hairstyle_logs").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteHairWashLog(id: string) {
  const { error } = await supabase.from("hair_wash_logs").delete().eq("id", id);
  if (error) throw error;
}

export async function updateHairWashLog(id: string, washedAt: Date) {
  const { error } = await supabase
    .from("hair_wash_logs")
    .update({
      washed_at: washedAt.toISOString(),
      wash_date: format(washedAt, "yyyy-MM-dd"),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function fetchHairstylesPage(userId: string, page: number) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, error } = await supabase
    .from("hairstyle_logs")
    .select("*")
    .eq("user_id", userId)
    .order("style_date", { ascending: false })
    .range(from, to);
  if (error) throw error;
  return {
    items: (data ?? []) as HairstyleLog[],
    nextPage: (data?.length ?? 0) === PAGE_SIZE ? page + 1 : undefined,
  };
}

export async function fetchHairstyleById(id: string): Promise<HairstyleLog> {
  const { data, error } = await supabase.from("hairstyle_logs").select("*").eq("id", id).single();
  if (error) throw error;
  return data as HairstyleLog;
}

export async function getHairstylePhotoUrl(photoPath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("hairstyles")
    .createSignedUrl(photoPath, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}

export async function fetchHairWashHistoryPage(userId: string, page: number) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, error } = await supabase
    .from("hair_wash_logs")
    .select("*")
    .eq("user_id", userId)
    .order("wash_date", { ascending: false })
    .range(from, to);
  if (error) throw error;
  return {
    items: (data ?? []) as HairWashLog[],
    nextPage: (data?.length ?? 0) === PAGE_SIZE ? page + 1 : undefined,
  };
}

// -------- Perfil de cabello (fila única por usuario) --------

export async function fetchHairProfile(userId: string): Promise<HairProfile | null> {
  const { data, error } = await supabase
    .from("hair_profile")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as HairProfile | null;
}

export async function upsertHairProfile(userId: string, input: HairProfile) {
  const { error } = await supabase.from("hair_profile").upsert(
    {
      user_id: userId,
      hair_characteristics: input.hair_characteristics,
      uses_products: input.uses_products,
      products_used: input.products_used,
      is_dyed: input.is_dyed,
      dye_color: input.dye_color,
    },
    { onConflict: "user_id" }
  );
  if (error) throw error;
}
