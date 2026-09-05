import type { AvatarCategory } from "@/features/premium/avatar/types";

export interface AvatarPieceDef {
  id: string;
  label: string;
  cost: number; // MOOney. 0 = pieza inicial, ya desbloqueada para todo usuario Full.
  swatch?: string; // solo color_piel: hex de referencia para el selector visual
}

export const AVATAR_CATALOG: Record<AvatarCategory, AvatarPieceDef[]> = {
  cara: [
    { id: "base-1", label: "Redonda", cost: 0 },
    { id: "base-2", label: "Ovalada", cost: 40 },
    { id: "base-3", label: "Angular", cost: 60 },
  ],
  pelo: [
    { id: "corto-1", label: "Corto", cost: 0 },
    { id: "ondulado-1", label: "Ondulado", cost: 30 },
    { id: "rapado-1", label: "Rapado", cost: 50 },
  ],
  color_piel: [
    { id: "tono-1", label: "Claro", cost: 0, swatch: "#f2c9a1" },
    { id: "tono-2", label: "Medio", cost: 20, swatch: "#c68642" },
    { id: "tono-3", label: "Oscuro", cost: 20, swatch: "#8d5524" },
  ],
  accesorio: [
    { id: "lentes-1", label: "Lentes", cost: 40 },
    { id: "aros-1", label: "Aros", cost: 30 },
  ],
};

export function findPiece(category: AvatarCategory, pieceId: string): AvatarPieceDef | undefined {
  return AVATAR_CATALOG[category].find((p) => p.id === pieceId);
}

export function isStarterPiece(category: AvatarCategory, pieceId: string): boolean {
  return findPiece(category, pieceId)?.cost === 0;
}
