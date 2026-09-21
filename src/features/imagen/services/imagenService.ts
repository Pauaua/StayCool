// expo-file-system v19+ reemplazó readAsStringAsync/EncodingType por una API
// basada en clases File/Directory; "expo-file-system/legacy" mantiene la API
// anterior tal cual, que es la que usamos acá.
import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import type {
  FaceLog,
  FaceProduct,
  FaceProductCategory,
  OutfitClothingType,
  OutfitLog,
  OutfitWeather,
  ShoeCondition,
  ShoeLog,
  ShoeType,
} from "@/features/imagen/types";

async function uploadPhoto(bucket: string, path: string, localImageUri: string) {
  // fetch(uri).blob() no es confiable en React Native (falla silenciosamente
  // en varios devices/SDKs de Expo); leer como base64 y subir el
  // ArrayBuffer decodificado es el camino documentado por Supabase para RN.
  const base64 = await FileSystem.readAsStringAsync(localImageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, decode(base64), { upsert: true, contentType: "image/jpeg" });
  if (error) throw error;
}

// -------- Vestuario (outfit_logs) --------

export async function fetchWeekOutfits(userId: string, fromDate: string, toDate: string) {
  const { data, error } = await supabase
    .from("outfit_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("outfit_date", fromDate)
    .lte("outfit_date", toDate)
    .order("outfit_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as OutfitLog[];
}

export async function saveOutfitLog(
  userId: string,
  date: string,
  description: string,
  localImageUri?: string,
  details?: {
    weather?: OutfitWeather;
    clothingType?: OutfitClothingType;
    mainColors?: string;
    usedAccessories?: boolean;
    accessoriesDescription?: string;
    notes?: string;
  }
) {
  let photoPath: string | null = null;
  if (localImageUri) {
    photoPath = `${userId}/${date}.jpg`;
    await uploadPhoto("outfits", photoPath, localImageUri);
  }
  const { error } = await supabase.from("outfit_logs").upsert(
    {
      user_id: userId,
      outfit_date: date,
      description,
      photo_path: photoPath,
      weather: details?.weather ?? null,
      clothing_type: details?.clothingType ?? null,
      main_colors: details?.mainColors ?? null,
      used_accessories: details?.usedAccessories ?? false,
      accessories_description: details?.usedAccessories
        ? details?.accessoriesDescription ?? null
        : null,
      notes: details?.notes ?? null,
    },
    { onConflict: "user_id,outfit_date" }
  );
  if (error) throw error;
}

export async function fetchOutfitById(outfitId: string): Promise<OutfitLog> {
  const { data, error } = await supabase.from("outfit_logs").select("*").eq("id", outfitId).single();
  if (error) throw error;
  return data as OutfitLog;
}

export async function updateOutfitLog(
  id: string,
  userId: string,
  outfitDate: string,
  description: string,
  localImageUri: string | undefined,
  details: {
    weather?: OutfitWeather;
    clothingType?: OutfitClothingType;
    mainColors?: string;
    usedAccessories?: boolean;
    accessoriesDescription?: string;
    notes?: string;
  }
) {
  let photoPath: string | undefined;
  if (localImageUri) {
    photoPath = `${userId}/${outfitDate}.jpg`;
    await uploadPhoto("outfits", photoPath, localImageUri);
  }
  const { error } = await supabase
    .from("outfit_logs")
    .update({
      description,
      weather: details.weather ?? null,
      clothing_type: details.clothingType ?? null,
      main_colors: details.mainColors ?? null,
      used_accessories: details.usedAccessories ?? false,
      accessories_description: details.usedAccessories ? details.accessoriesDescription ?? null : null,
      notes: details.notes ?? null,
      ...(photoPath ? { photo_path: photoPath } : {}),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteOutfitLog(id: string) {
  const { error } = await supabase.from("outfit_logs").delete().eq("id", id);
  if (error) throw error;
}

export async function getOutfitPhotoUrl(photoPath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("outfits")
    .createSignedUrl(photoPath, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}

// -------- Zapatos (shoe_logs) --------

export async function fetchWeekShoes(userId: string, fromDate: string, toDate: string) {
  const { data, error } = await supabase
    .from("shoe_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("shoe_date", fromDate)
    .lte("shoe_date", toDate)
    .order("shoe_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ShoeLog[];
}

export async function saveShoeLog(
  userId: string,
  date: string,
  description: string,
  localImageUri?: string,
  details?: {
    weather?: OutfitWeather;
    shoeType?: ShoeType;
    color?: string;
    brand?: string;
    condition?: ShoeCondition;
    notes?: string;
  }
) {
  let photoPath: string | null = null;
  if (localImageUri) {
    photoPath = `${userId}/${date}.jpg`;
    await uploadPhoto("shoes", photoPath, localImageUri);
  }
  const { error } = await supabase.from("shoe_logs").upsert(
    {
      user_id: userId,
      shoe_date: date,
      description,
      photo_path: photoPath,
      weather: details?.weather ?? null,
      shoe_type: details?.shoeType ?? null,
      color: details?.color ?? null,
      brand: details?.brand ?? null,
      condition: details?.condition ?? null,
      notes: details?.notes ?? null,
    },
    { onConflict: "user_id,shoe_date" }
  );
  if (error) throw error;
}

export async function fetchShoeById(shoeId: string): Promise<ShoeLog> {
  const { data, error } = await supabase.from("shoe_logs").select("*").eq("id", shoeId).single();
  if (error) throw error;
  return data as ShoeLog;
}

export async function updateShoeLog(
  id: string,
  userId: string,
  shoeDate: string,
  description: string,
  localImageUri: string | undefined,
  details: {
    weather?: OutfitWeather;
    shoeType?: ShoeType;
    color?: string;
    brand?: string;
    condition?: ShoeCondition;
    notes?: string;
  }
) {
  let photoPath: string | undefined;
  if (localImageUri) {
    photoPath = `${userId}/${shoeDate}.jpg`;
    await uploadPhoto("shoes", photoPath, localImageUri);
  }
  const { error } = await supabase
    .from("shoe_logs")
    .update({
      description,
      weather: details.weather ?? null,
      shoe_type: details.shoeType ?? null,
      color: details.color ?? null,
      brand: details.brand ?? null,
      condition: details.condition ?? null,
      notes: details.notes ?? null,
      ...(photoPath ? { photo_path: photoPath } : {}),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteShoeLog(id: string) {
  const { error } = await supabase.from("shoe_logs").delete().eq("id", id);
  if (error) throw error;
}

export async function getShoePhotoUrl(photoPath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("shoes")
    .createSignedUrl(photoPath, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}

// -------- Cara (face_logs, solo maquillaje) --------

export async function upsertFaceLog(userId: string, input: { woreMakeup: boolean }) {
  const today = format(new Date(), "yyyy-MM-dd");
  const { error } = await supabase.from("face_logs").upsert(
    { user_id: userId, face_date: today, wore_makeup: input.woreMakeup },
    { onConflict: "user_id,face_date" }
  );
  if (error) throw error;
}

export async function fetchWeekFaceLogs(userId: string, fromDate: string): Promise<FaceLog[]> {
  const { data, error } = await supabase
    .from("face_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("face_date", fromDate)
    .order("face_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as FaceLog[];
}

// -------- Productos de rostro (limpieza facial / maquillaje) --------

export async function fetchFaceProducts(
  userId: string,
  category: FaceProductCategory
): Promise<FaceProduct[]> {
  const { data, error } = await supabase
    .from("face_products")
    .select("*")
    .eq("user_id", userId)
    .eq("category", category)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as FaceProduct[];
}

export async function createFaceProduct(
  userId: string,
  input: {
    category: FaceProductCategory;
    name: string;
    brand?: string;
    price?: number;
    rating?: number;
  }
) {
  const { error } = await supabase.from("face_products").insert({
    user_id: userId,
    category: input.category,
    name: input.name,
    brand: input.brand ?? null,
    price: input.price ?? null,
    rating: input.rating ?? null,
  });
  if (error) throw error;
}

export async function updateFaceProduct(
  productId: string,
  input: { name: string; brand?: string; price?: number; rating?: number }
) {
  const { error } = await supabase
    .from("face_products")
    .update({
      name: input.name,
      brand: input.brand ?? null,
      price: input.price ?? null,
      rating: input.rating ?? null,
    })
    .eq("id", productId);
  if (error) throw error;
}

export async function deleteFaceProduct(productId: string) {
  const { error } = await supabase.from("face_products").delete().eq("id", productId);
  if (error) throw error;
}
