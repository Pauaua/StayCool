export interface HygieneItem {
  id: string;
  user_id: string;
  label: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  // Ítem especial: al marcarlo completado, también deja un registro con
  // fecha/hora exacta en hair_wash_logs (ver toggleHygieneLog).
  is_hair_wash: boolean;
  created_at: string;
  updated_at: string;
}

export interface HygieneLog {
  id: string;
  user_id: string;
  hygiene_item_id: string;
  log_date: string;
  completed: boolean;
  completed_at: string;
  created_at: string;
  updated_at: string;
}

export interface HygieneDaySummary {
  log_date: string;
  totalItems: number;
  completedItems: number;
}

export interface HygieneLogDetail {
  id: string;
  hygiene_item_id: string;
  completed: boolean;
  hygiene_items: { label: string; icon: string | null } | null;
}
