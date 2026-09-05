// Tipos generados a mano a partir de supabase/migrations/0001_init.sql.
// En un proyecto real esto se regenera con:
//   npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          timezone: string;
          makeup_reminder_enabled: boolean;
          makeup_reminder_time: string;
          hygiene_reminder_enabled: boolean;
          hygiene_reminder_time: string;
          monthly_budget: number | null;
          premium_tier: "free" | "basico" | "full";
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      avatar_selections: {
        Row: {
          user_id: string;
          cara: string;
          pelo: string;
          color_piel: string;
          accesorio: string | null;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["avatar_selections"]["Row"]> & {
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["avatar_selections"]["Row"]>;
        Relationships: [];
      };
      avatar_unlocked_pieces: {
        Row: {
          user_id: string;
          category: "cara" | "pelo" | "color_piel" | "accesorio";
          piece_id: string;
          unlocked_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["avatar_unlocked_pieces"]["Row"], "unlocked_at"> & {
          unlocked_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["avatar_unlocked_pieces"]["Row"]>;
        Relationships: [];
      };
      moo_ney_balance: {
        Row: {
          user_id: string;
          balance: number;
          updated_at: string;
        };
        Insert: Database["public"]["Tables"]["moo_ney_balance"]["Row"];
        Update: Partial<Database["public"]["Tables"]["moo_ney_balance"]["Row"]>;
        Relationships: [];
      };
      moo_ney_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          action_key: string;
          reason: string;
          metadata: Json;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["moo_ney_transactions"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["moo_ney_transactions"]["Row"]>;
        Relationships: [];
      };
      hygiene_items: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          icon: string | null;
          sort_order: number;
          is_active: boolean;
          is_hair_wash: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["hygiene_items"]["Row"],
          "id" | "is_hair_wash" | "created_at" | "updated_at"
        > & { id?: string; is_hair_wash?: boolean };
        Update: Partial<Database["public"]["Tables"]["hygiene_items"]["Row"]>;
        Relationships: [];
      };
      hygiene_logs: {
        Row: {
          id: string;
          user_id: string;
          hygiene_item_id: string;
          log_date: string;
          completed: boolean;
          completed_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["hygiene_logs"]["Row"],
          "id" | "created_at" | "updated_at"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["hygiene_logs"]["Row"]>;
        Relationships: [];
      };
      expense_quick_logs: {
        Row: {
          id: string;
          user_id: string;
          expense_date: string;
          name: string;
          expense_type: string;
          description: string | null;
          amount: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["expense_quick_logs"]["Row"],
          "id" | "expense_date" | "created_at" | "updated_at"
        > & { id?: string; expense_date?: string };
        Update: Partial<Database["public"]["Tables"]["expense_quick_logs"]["Row"]>;
        Relationships: [];
      };
      social_activities: {
        Row: {
          id: string;
          user_id: string;
          activity_type: "laboral" | "amistosa" | "casual" | "familiar" | "cita" | "otro";
          title: string | null;
          companions: string | null;
          activity_description: string | null;
          scheduled_at: string;
          is_past: boolean;
          feeling: "genial" | "bien" | "neutral" | "mal" | "agotado" | null;
          next_activity_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["social_activities"]["Row"],
          "id" | "next_activity_id" | "created_at" | "updated_at"
        > & { id?: string; next_activity_id?: string | null };
        Update: Partial<Database["public"]["Tables"]["social_activities"]["Row"]>;
        Relationships: [];
      };
      wellness_meals: {
        Row: {
          id: string;
          user_id: string;
          eaten_at: string;
          meal_date: string;
          category: "desayuno" | "almuerzo" | "cena" | "snack" | null;
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["wellness_meals"]["Row"],
          "id" | "eaten_at" | "meal_date" | "created_at" | "updated_at"
        > & { id?: string; eaten_at?: string; meal_date?: string };
        Update: Partial<Database["public"]["Tables"]["wellness_meals"]["Row"]>;
        Relationships: [];
      };
      wellness_sleep: {
        Row: {
          id: string;
          user_id: string;
          sleep_date: string;
          slept_at: string;
          woke_at: string;
          duration_minutes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["wellness_sleep"]["Row"],
          "id" | "sleep_date" | "duration_minutes" | "created_at" | "updated_at"
        > & { id?: string; sleep_date?: string };
        Update: Partial<Database["public"]["Tables"]["wellness_sleep"]["Row"]>;
        Relationships: [];
      };
      wellness_exercise: {
        Row: {
          id: string;
          user_id: string;
          exercise_date: string;
          exercise_type: string;
          duration_minutes: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["wellness_exercise"]["Row"],
          "id" | "exercise_date" | "notes" | "created_at" | "updated_at"
        > & { id?: string; exercise_date?: string; notes?: string | null };
        Update: Partial<Database["public"]["Tables"]["wellness_exercise"]["Row"]>;
        Relationships: [];
      };
      wellness_mood: {
        Row: {
          id: string;
          user_id: string;
          mood_date: string;
          mood: "genial" | "bien" | "neutral" | "mal" | "agotado";
          energy_level: number | null;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["wellness_mood"]["Row"],
          "id" | "mood_date" | "note" | "created_at" | "updated_at"
        > & { id?: string; mood_date?: string; note?: string | null };
        Update: Partial<Database["public"]["Tables"]["wellness_mood"]["Row"]>;
        Relationships: [];
      };
      outfit_logs: {
        Row: {
          id: string;
          user_id: string;
          outfit_date: string;
          description: string | null;
          photo_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["outfit_logs"]["Row"],
          "id" | "outfit_date" | "created_at" | "updated_at"
        > & { id?: string; outfit_date?: string };
        Update: Partial<Database["public"]["Tables"]["outfit_logs"]["Row"]>;
        Relationships: [];
      };
      shoe_logs: {
        Row: {
          id: string;
          user_id: string;
          shoe_date: string;
          description: string | null;
          photo_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["shoe_logs"]["Row"],
          "id" | "shoe_date" | "created_at" | "updated_at"
        > & { id?: string; shoe_date?: string };
        Update: Partial<Database["public"]["Tables"]["shoe_logs"]["Row"]>;
        Relationships: [];
      };
      face_logs: {
        Row: {
          id: string;
          user_id: string;
          face_date: string;
          wore_makeup: boolean;
          removed_makeup: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["face_logs"]["Row"],
          "id" | "face_date" | "removed_makeup" | "created_at" | "updated_at"
        > & { id?: string; face_date?: string; removed_makeup?: boolean };
        Update: Partial<Database["public"]["Tables"]["face_logs"]["Row"]>;
        Relationships: [];
      };
      hair_profile: {
        Row: {
          user_id: string;
          hair_characteristics: string | null;
          uses_products: boolean;
          products_used: string | null;
          is_dyed: boolean;
          dye_color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["hair_profile"]["Row"],
          "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["hair_profile"]["Row"]>;
        Relationships: [];
      };
      hair_wash_logs: {
        Row: {
          id: string;
          user_id: string;
          washed_at: string;
          wash_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["hair_wash_logs"]["Row"],
          "id" | "washed_at" | "wash_date" | "created_at" | "updated_at"
        > & { id?: string; washed_at?: string; wash_date?: string };
        Update: Partial<Database["public"]["Tables"]["hair_wash_logs"]["Row"]>;
        Relationships: [];
      };
      hairstyle_logs: {
        Row: {
          id: string;
          user_id: string;
          style_date: string;
          hairstyle: string;
          photo_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["hairstyle_logs"]["Row"],
          "id" | "style_date" | "photo_path" | "created_at" | "updated_at"
        > & { id?: string; style_date?: string; photo_path?: string | null };
        Update: Partial<Database["public"]["Tables"]["hairstyle_logs"]["Row"]>;
        Relationships: [];
      };
      expense_detailed_logs: {
        Row: {
          id: string;
          user_id: string;
          expense_date: string;
          item_purchased: string;
          purpose: string | null;
          amount: number;
          expense_kind: "fijo" | "extra" | "hormiga" | "innecesario";
          could_wait: boolean;
          remaining_balance: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["expense_detailed_logs"]["Row"],
          "id" | "expense_date" | "remaining_balance" | "created_at" | "updated_at"
        > & { id?: string; expense_date?: string; remaining_balance?: number | null };
        Update: Partial<Database["public"]["Tables"]["expense_detailed_logs"]["Row"]>;
        Relationships: [];
      };
      function_rate_limits: {
        Row: {
          user_id: string;
          function_name: string;
          window_start: string;
          request_count: number;
        };
        Insert: Database["public"]["Tables"]["function_rate_limits"]["Row"];
        Update: Partial<Database["public"]["Tables"]["function_rate_limits"]["Row"]>;
        Relationships: [];
      };
      taste_quick_logs: {
        Row: {
          id: string;
          user_id: string;
          logged_at: string;
          logged_date: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["taste_quick_logs"]["Row"],
          "id" | "logged_at" | "logged_date" | "created_at" | "updated_at"
        > & { id?: string; logged_at?: string; logged_date?: string };
        Update: Partial<Database["public"]["Tables"]["taste_quick_logs"]["Row"]>;
        Relationships: [];
      };
      taste_detailed_logs: {
        Row: {
          id: string;
          user_id: string;
          logged_at: string;
          logged_date: string;
          category: "musica" | "serie" | "pelicula" | "libro" | "otro";
          name: string;
          genre: string | null;
          notes: string | null;
          details: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["taste_detailed_logs"]["Row"],
          "id" | "logged_at" | "logged_date" | "created_at" | "updated_at"
        > & { id?: string; logged_at?: string; logged_date?: string };
        Update: Partial<Database["public"]["Tables"]["taste_detailed_logs"]["Row"]>;
        Relationships: [];
      };
      note_quick_logs: {
        Row: {
          id: string;
          user_id: string;
          logged_at: string;
          logged_date: string;
          name: string;
          description: string | null;
          feeling: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["note_quick_logs"]["Row"],
          "id" | "logged_at" | "logged_date" | "created_at" | "updated_at"
        > & { id?: string; logged_at?: string; logged_date?: string };
        Update: Partial<Database["public"]["Tables"]["note_quick_logs"]["Row"]>;
        Relationships: [];
      };
      note_detailed_logs: {
        Row: {
          id: string;
          user_id: string;
          logged_at: string;
          logged_date: string;
          name: string;
          location: string | null;
          idea: string;
          feelings: string | null;
          thoughts: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["note_detailed_logs"]["Row"],
          "id" | "logged_at" | "logged_date" | "created_at" | "updated_at"
        > & { id?: string; logged_at?: string; logged_date?: string };
        Update: Partial<Database["public"]["Tables"]["note_detailed_logs"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      sync_mooney: {
        Args: Record<string, never>;
        Returns: { action_key: string; amount: number; reason: string }[];
      };
      grant_mooney_for_resumen: {
        Args: { p_period_key: string };
        Returns: number;
      };
      spend_mooney: {
        Args: { p_amount: number; p_reason: string; p_metadata?: Json };
        Returns: number;
      };
      purchase_avatar_piece: {
        Args: { p_category: string; p_piece_id: string; p_cost: number };
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
