export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      avatar_selections: {
        Row: {
          accesorio: string | null
          cara: string
          color_piel: string
          pelo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accesorio?: string | null
          cara?: string
          color_piel?: string
          pelo?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accesorio?: string | null
          cara?: string
          color_piel?: string
          pelo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      avatar_unlocked_pieces: {
        Row: {
          category: string
          piece_id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          category: string
          piece_id: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          category?: string
          piece_id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expense_detailed_logs: {
        Row: {
          amount: number
          could_wait: boolean
          created_at: string
          expense_date: string
          expense_kind: string
          id: string
          item_purchased: string
          purpose: string | null
          remaining_balance: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          could_wait?: boolean
          created_at?: string
          expense_date?: string
          expense_kind: string
          id?: string
          item_purchased: string
          purpose?: string | null
          remaining_balance?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          could_wait?: boolean
          created_at?: string
          expense_date?: string
          expense_kind?: string
          id?: string
          item_purchased?: string
          purpose?: string | null
          remaining_balance?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expense_quick_logs: {
        Row: {
          amount: number | null
          created_at: string
          description: string | null
          expense_date: string
          expense_type: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          description?: string | null
          expense_date?: string
          expense_type: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          description?: string | null
          expense_date?: string
          expense_type?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      face_logs: {
        Row: {
          created_at: string
          face_date: string
          id: string
          removed_makeup: boolean
          updated_at: string
          user_id: string
          wore_makeup: boolean
        }
        Insert: {
          created_at?: string
          face_date?: string
          id?: string
          removed_makeup?: boolean
          updated_at?: string
          user_id: string
          wore_makeup?: boolean
        }
        Update: {
          created_at?: string
          face_date?: string
          id?: string
          removed_makeup?: boolean
          updated_at?: string
          user_id?: string
          wore_makeup?: boolean
        }
        Relationships: []
      }
      face_products: {
        Row: {
          brand: string | null
          category: string
          created_at: string
          id: string
          name: string
          price: number | null
          rating: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand?: string | null
          category: string
          created_at?: string
          id?: string
          name: string
          price?: number | null
          rating?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string | null
          category?: string
          created_at?: string
          id?: string
          name?: string
          price?: number | null
          rating?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      function_rate_limits: {
        Row: {
          function_name: string
          request_count: number
          user_id: string
          window_start: string
        }
        Insert: {
          function_name: string
          request_count?: number
          user_id: string
          window_start: string
        }
        Update: {
          function_name?: string
          request_count?: number
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      hair_profile: {
        Row: {
          created_at: string
          dye_color: string | null
          hair_characteristics: string | null
          is_dyed: boolean
          products_used: string | null
          updated_at: string
          user_id: string
          uses_products: boolean
        }
        Insert: {
          created_at?: string
          dye_color?: string | null
          hair_characteristics?: string | null
          is_dyed?: boolean
          products_used?: string | null
          updated_at?: string
          user_id: string
          uses_products?: boolean
        }
        Update: {
          created_at?: string
          dye_color?: string | null
          hair_characteristics?: string | null
          is_dyed?: boolean
          products_used?: string | null
          updated_at?: string
          user_id?: string
          uses_products?: boolean
        }
        Relationships: []
      }
      hair_wash_logs: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
          wash_date: string
          washed_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          wash_date?: string
          washed_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          wash_date?: string
          washed_at?: string
        }
        Relationships: []
      }
      hairstyle_logs: {
        Row: {
          created_at: string
          hairstyle: string
          id: string
          is_special_occasion: boolean
          occasion_details: string | null
          photo_path: string | null
          style_date: string
          style_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hairstyle: string
          id?: string
          is_special_occasion?: boolean
          occasion_details?: string | null
          photo_path?: string | null
          style_date?: string
          style_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hairstyle?: string
          id?: string
          is_special_occasion?: boolean
          occasion_details?: string | null
          photo_path?: string | null
          style_date?: string
          style_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hygiene_items: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_active: boolean
          is_hair_wash: boolean
          label: string
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          is_hair_wash?: boolean
          label: string
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          is_hair_wash?: boolean
          label?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hygiene_logs: {
        Row: {
          completed: boolean
          completed_at: string
          created_at: string
          hygiene_item_id: string
          id: string
          log_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string
          created_at?: string
          hygiene_item_id: string
          id?: string
          log_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string
          created_at?: string
          hygiene_item_id?: string
          id?: string
          log_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hygiene_logs_hygiene_item_id_fkey"
            columns: ["hygiene_item_id"]
            isOneToOne: false
            referencedRelation: "hygiene_items"
            referencedColumns: ["id"]
          },
        ]
      }
      moo_ney_balance: {
        Row: {
          balance: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      moo_ney_transactions: {
        Row: {
          action_key: string
          amount: number
          created_at: string
          id: string
          metadata: Json
          reason: string
          user_id: string
        }
        Insert: {
          action_key: string
          amount: number
          created_at?: string
          id?: string
          metadata?: Json
          reason: string
          user_id: string
        }
        Update: {
          action_key?: string
          amount?: number
          created_at?: string
          id?: string
          metadata?: Json
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      note_detailed_logs: {
        Row: {
          created_at: string
          feelings: string | null
          id: string
          idea: string
          location: string | null
          logged_at: string
          logged_date: string
          name: string
          thoughts: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feelings?: string | null
          id?: string
          idea: string
          location?: string | null
          logged_at?: string
          logged_date?: string
          name: string
          thoughts?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feelings?: string | null
          id?: string
          idea?: string
          location?: string | null
          logged_at?: string
          logged_date?: string
          name?: string
          thoughts?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      note_quick_logs: {
        Row: {
          created_at: string
          description: string | null
          feeling: string | null
          id: string
          logged_at: string
          logged_date: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          feeling?: string | null
          id?: string
          logged_at?: string
          logged_date?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          feeling?: string | null
          id?: string
          logged_at?: string
          logged_date?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      outfit_logs: {
        Row: {
          accessories_description: string | null
          clothing_type: string | null
          created_at: string
          description: string | null
          id: string
          main_colors: string | null
          notes: string | null
          outfit_date: string
          photo_path: string | null
          updated_at: string
          used_accessories: boolean
          user_id: string
          weather: string | null
        }
        Insert: {
          accessories_description?: string | null
          clothing_type?: string | null
          created_at?: string
          description?: string | null
          id?: string
          main_colors?: string | null
          notes?: string | null
          outfit_date?: string
          photo_path?: string | null
          updated_at?: string
          used_accessories?: boolean
          user_id: string
          weather?: string | null
        }
        Update: {
          accessories_description?: string | null
          clothing_type?: string | null
          created_at?: string
          description?: string | null
          id?: string
          main_colors?: string | null
          notes?: string | null
          outfit_date?: string
          photo_path?: string | null
          updated_at?: string
          used_accessories?: boolean
          user_id?: string
          weather?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          cycle_length_days: number
          display_name: string | null
          hygiene_reminder_enabled: boolean
          hygiene_reminder_time: string
          id: string
          is_menstruating: boolean
          language: string
          last_period_date: string | null
          makeup_reminder_enabled: boolean
          makeup_reminder_time: string
          monthly_budget: number | null
          paused_at: string | null
          period_reminder_days_before: number
          period_reminder_enabled: boolean
          period_reminder_message: string | null
          premium_tier: string
          pronoun: string
          skincare_morning_reminder_enabled: boolean
          skincare_morning_reminder_time: string
          skincare_night_reminder_enabled: boolean
          skincare_night_reminder_time: string
          timezone: string
          trial_claimed_at: string | null
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          cycle_length_days?: number
          display_name?: string | null
          hygiene_reminder_enabled?: boolean
          hygiene_reminder_time?: string
          id: string
          is_menstruating?: boolean
          language?: string
          last_period_date?: string | null
          makeup_reminder_enabled?: boolean
          makeup_reminder_time?: string
          monthly_budget?: number | null
          paused_at?: string | null
          period_reminder_days_before?: number
          period_reminder_enabled?: boolean
          period_reminder_message?: string | null
          premium_tier?: string
          pronoun?: string
          skincare_morning_reminder_enabled?: boolean
          skincare_morning_reminder_time?: string
          skincare_night_reminder_enabled?: boolean
          skincare_night_reminder_time?: string
          timezone?: string
          trial_claimed_at?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          cycle_length_days?: number
          display_name?: string | null
          hygiene_reminder_enabled?: boolean
          hygiene_reminder_time?: string
          id?: string
          is_menstruating?: boolean
          language?: string
          last_period_date?: string | null
          makeup_reminder_enabled?: boolean
          makeup_reminder_time?: string
          monthly_budget?: number | null
          paused_at?: string | null
          period_reminder_days_before?: number
          period_reminder_enabled?: boolean
          period_reminder_message?: string | null
          premium_tier?: string
          pronoun?: string
          skincare_morning_reminder_enabled?: boolean
          skincare_morning_reminder_time?: string
          skincare_night_reminder_enabled?: boolean
          skincare_night_reminder_time?: string
          timezone?: string
          trial_claimed_at?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      shoe_logs: {
        Row: {
          brand: string | null
          color: string | null
          condition: string | null
          created_at: string
          description: string | null
          id: string
          notes: string | null
          photo_path: string | null
          shoe_date: string
          shoe_type: string | null
          updated_at: string
          user_id: string
          weather: string | null
        }
        Insert: {
          brand?: string | null
          color?: string | null
          condition?: string | null
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          photo_path?: string | null
          shoe_date?: string
          shoe_type?: string | null
          updated_at?: string
          user_id: string
          weather?: string | null
        }
        Update: {
          brand?: string | null
          color?: string | null
          condition?: string | null
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          photo_path?: string | null
          shoe_date?: string
          shoe_type?: string | null
          updated_at?: string
          user_id?: string
          weather?: string | null
        }
        Relationships: []
      }
      social_activities: {
        Row: {
          activity_description: string | null
          activity_type: string
          companions: string | null
          created_at: string
          feeling: string | null
          id: string
          is_past: boolean
          next_activity_id: string | null
          scheduled_at: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_description?: string | null
          activity_type: string
          companions?: string | null
          created_at?: string
          feeling?: string | null
          id?: string
          is_past?: boolean
          next_activity_id?: string | null
          scheduled_at: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_description?: string | null
          activity_type?: string
          companions?: string | null
          created_at?: string
          feeling?: string | null
          id?: string
          is_past?: boolean
          next_activity_id?: string | null
          scheduled_at?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_activities_next_activity_id_fkey"
            columns: ["next_activity_id"]
            isOneToOne: false
            referencedRelation: "social_activities"
            referencedColumns: ["id"]
          },
        ]
      }
      taste_detailed_logs: {
        Row: {
          category: string
          created_at: string
          details: Json
          genre: string | null
          id: string
          logged_at: string
          logged_date: string
          name: string
          notes: string | null
          rating: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          details?: Json
          genre?: string | null
          id?: string
          logged_at?: string
          logged_date?: string
          name: string
          notes?: string | null
          rating?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          details?: Json
          genre?: string | null
          id?: string
          logged_at?: string
          logged_date?: string
          name?: string
          notes?: string | null
          rating?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      taste_quick_logs: {
        Row: {
          created_at: string
          description: string | null
          id: string
          logged_at: string
          logged_date: string
          name: string
          rating: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          logged_at?: string
          logged_date?: string
          name: string
          rating?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          logged_at?: string
          logged_date?: string
          name?: string
          rating?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wellness_exercise: {
        Row: {
          created_at: string
          duration_minutes: number | null
          exercise_date: string
          exercise_type: string
          id: string
          notes: string | null
          sets: number | null
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          exercise_date?: string
          exercise_type: string
          id?: string
          notes?: string | null
          sets?: number | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          exercise_date?: string
          exercise_type?: string
          id?: string
          notes?: string | null
          sets?: number | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      wellness_meals: {
        Row: {
          category: string | null
          created_at: string
          description: string
          eaten_at: string
          id: string
          meal_date: string
          rating: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description: string
          eaten_at?: string
          id?: string
          meal_date?: string
          rating?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          eaten_at?: string
          id?: string
          meal_date?: string
          rating?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wellness_mood: {
        Row: {
          created_at: string
          energy_level: number | null
          id: string
          mood: string
          mood_date: string
          note: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          energy_level?: number | null
          id?: string
          mood: string
          mood_date?: string
          note?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          energy_level?: number | null
          id?: string
          mood?: string
          mood_date?: string
          note?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wellness_sleep: {
        Row: {
          created_at: string
          duration_minutes: number | null
          id: string
          sleep_date: string
          slept_at: string
          updated_at: string
          user_id: string
          woke_at: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          sleep_date?: string
          slept_at: string
          updated_at?: string
          user_id: string
          woke_at: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          sleep_date?: string
          slept_at?: string
          updated_at?: string
          user_id?: string
          woke_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _all_modules_touched: {
        Args: { p_date: string; p_user_id: string }
        Returns: boolean
      }
      _grant_mooney: {
        Args: {
          p_action_key: string
          p_amount: number
          p_metadata?: Json
          p_reason: string
          p_user_id: string
        }
        Returns: boolean
      }
      _hygiene_day_complete: {
        Args: { p_date: string; p_user_id: string }
        Returns: boolean
      }
      _hygiene_streak_length: {
        Args: { p_end_date: string; p_user_id: string }
        Returns: number
      }
      claim_trial: { Args: never; Returns: string }
      grant_mooney_for_resumen: {
        Args: { p_period_key: string }
        Returns: number
      }
      purchase_avatar_piece: {
        Args: { p_category: string; p_cost: number; p_piece_id: string }
        Returns: number
      }
      spend_mooney: {
        Args: { p_amount: number; p_metadata?: Json; p_reason: string }
        Returns: number
      }
      sync_mooney: {
        Args: never
        Returns: {
          action_key: string
          amount: number
          reason: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
