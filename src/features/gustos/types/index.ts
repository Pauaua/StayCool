export type TasteCategory = "musica" | "serie" | "pelicula" | "libro" | "otro";

export interface QuickTaste {
  id: string;
  logged_at: string;
  logged_date: string;
  name: string;
  description: string | null;
  rating: number | null;
}

// Campos específicos por categoría. Se guardan tal cual en la columna
// jsonb `details` de taste_detailed_logs.
export interface MusicDetails {
  favoriteBands?: string;
  instruments?: string;
  rhythms?: string;
}

export interface ScreenDetails {
  director?: string;
  cast?: string;
  season?: string;
}

export interface BookDetails {
  author?: string;
  saga?: string;
}

export type TasteDetails = MusicDetails & ScreenDetails & BookDetails;

export interface DetailedTaste {
  id: string;
  logged_at: string;
  logged_date: string;
  category: TasteCategory;
  name: string;
  genre: string | null;
  notes: string | null;
  details: TasteDetails;
  rating: number | null;
}
