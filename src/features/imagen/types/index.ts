export type OutfitWeather = "frio" | "calor" | "intermedio";
export type OutfitClothingType = "vestido" | "pantalon" | "falda" | "otro";

export interface OutfitLog {
  id: string;
  outfit_date: string;
  description: string | null;
  photo_path: string | null;
  weather: OutfitWeather | null;
  clothing_type: OutfitClothingType | null;
  main_colors: string | null;
  used_accessories: boolean;
  accessories_description: string | null;
  notes: string | null;
}

export type ShoeType =
  | "sandalia"
  | "zapatilla"
  | "botines"
  | "bototos"
  | "trekking"
  | "otro";
export type ShoeCondition = "bueno" | "pasable" | "necesita_cambio";

export interface ShoeLog {
  id: string;
  shoe_date: string;
  description: string | null;
  photo_path: string | null;
  weather: OutfitWeather | null;
  shoe_type: ShoeType | null;
  color: string | null;
  brand: string | null;
  condition: ShoeCondition | null;
  notes: string | null;
}

export interface FaceLog {
  id: string;
  face_date: string;
  wore_makeup: boolean;
  removed_makeup: boolean;
}

export type FaceProductCategory = "limpieza_facial" | "maquillaje";

export interface FaceProduct {
  id: string;
  category: FaceProductCategory;
  name: string;
  brand: string | null;
  price: number | null;
  rating: number | null;
  created_at: string;
}
