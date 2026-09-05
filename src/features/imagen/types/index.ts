export interface OutfitLog {
  id: string;
  outfit_date: string;
  description: string | null;
  photo_path: string | null;
}

export interface ShoeLog {
  id: string;
  shoe_date: string;
  description: string | null;
  photo_path: string | null;
}

export interface FaceLog {
  id: string;
  face_date: string;
  wore_makeup: boolean;
  removed_makeup: boolean;
}
