export interface HairWashLog {
  id: string;
  wash_date: string;
  washed_at: string;
}

export interface HairstyleLog {
  id: string;
  style_date: string;
  hairstyle: string;
  photo_path: string | null;
}

export interface HairProfile {
  hair_characteristics: string | null;
  uses_products: boolean;
  products_used: string | null;
  is_dyed: boolean;
  dye_color: string | null;
}
