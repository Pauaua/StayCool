// Selección de piezas del avatar Full, como datos simples y desacoplados
// del renderizador. Esto es lo único que se guarda en Supabase
// (avatar_selections) — el módulo renderAvatar.ts es lo único que sabe
// traducir esto a una imagen (hoy vía DiceBear), y es lo único que hay que
// reemplazar cuando exista arte propio. Los nombres de campo coinciden con
// las columnas de la tabla a propósito, para no tener que mapear ida y vuelta.
export interface AvatarSelection {
  cara: string;
  pelo: string;
  color_piel: string;
  accesorio: string | null;
}

export type AvatarCategory = "cara" | "pelo" | "color_piel" | "accesorio";
