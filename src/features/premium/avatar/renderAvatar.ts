import type { AvatarSelection } from "@/features/premium/avatar/types";
import { findPiece } from "@/features/premium/avatar/catalog";

// Único módulo que sabe traducir una AvatarSelection a una imagen. Hoy usa
// DiceBear (https://www.dicebear.com) como placeholder open-source; cuando
// haya piezas de arte propio, se reemplaza SOLO este archivo — nada de
// avatarService.ts, la tienda ni la tabla avatar_selections cambian.
//
// El seed determinístico (piezas concatenadas) hace que la combinación de
// cara/pelo/color/accesorio siempre resuelva a la misma imagen, y que
// combinaciones distintas se vean visiblemente distintas. El backgroundColor
// usa el swatch del tono de piel elegido — es un parámetro universal de la
// API HTTP de DiceBear (funciona en cualquier estilo).
const DICEBEAR_STYLE = "adventurer";
const DICEBEAR_BASE = `https://api.dicebear.com/9.x/${DICEBEAR_STYLE}/png`;

export function renderAvatarUrl(selection: AvatarSelection, size = 256): string {
  const seed = [selection.cara, selection.pelo, selection.color_piel, selection.accesorio ?? "sin-accesorio"].join(
    "-"
  );
  const swatch = findPiece("color_piel", selection.color_piel)?.swatch?.replace("#", "") ?? "efe9f3";

  const params = new URLSearchParams({
    seed,
    size: String(size),
    backgroundColor: swatch,
    backgroundType: "solid",
  });

  return `${DICEBEAR_BASE}?${params.toString()}`;
}
