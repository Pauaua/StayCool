import { supabase } from "@/lib/supabase";
import type { AvatarCategory, AvatarSelection } from "@/features/premium/avatar/types";

const DEFAULT_SELECTION: AvatarSelection = {
  cara: "base-1",
  pelo: "corto-1",
  color_piel: "tono-1",
  accesorio: null,
};

export async function fetchAvatarSelection(userId: string): Promise<AvatarSelection> {
  const { data, error } = await supabase
    .from("avatar_selections")
    .select("cara, pelo, color_piel, accesorio")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ?? DEFAULT_SELECTION;
}

export async function fetchUnlockedPieceIds(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("avatar_unlocked_pieces")
    .select("category, piece_id")
    .eq("user_id", userId);
  if (error) throw error;
  return new Set((data ?? []).map((row) => `${row.category}:${row.piece_id}`));
}

// Piezas iniciales (cost 0) se pueden equipar sin pasar por purchase_avatar_piece
// (no hay nada que "comprar"), así que se guardan directo en avatar_selections.
export async function equipStarterPiece(userId: string, category: AvatarCategory, pieceId: string) {
  const patch: Partial<AvatarSelection> & { user_id: string } = { user_id: userId };
  patch[category] = pieceId;
  const { error } = await supabase.from("avatar_selections").upsert(patch, { onConflict: "user_id" });
  if (error) throw error;
}

// Sparkless/MOOney para modificar el avatar: deshabilitado a propósito.
// Piezas pagas: todo pasa por la función RPC (paga + desbloquea + equipa
// atómico y validado en el servidor).
// export async function purchaseAndEquipPiece(category: AvatarCategory, pieceId: string, cost: number) {
//   const { data, error } = await supabase.rpc("purchase_avatar_piece", {
//     p_category: category,
//     p_piece_id: pieceId,
//     p_cost: cost,
//   });
//   if (error) throw error;
//   return data as number; // saldo restante
// }
