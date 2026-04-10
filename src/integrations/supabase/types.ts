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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      drill_recommendations: {
        Row: {
          expires_at: string
          generated_at: string
          id: string
          reasoning: string | null
          recommendations: Json
          user_id: string
        }
        Insert: {
          expires_at?: string
          generated_at?: string
          id?: string
          reasoning?: string | null
          recommendations?: Json
          user_id: string
        }
        Update: {
          expires_at?: string
          generated_at?: string
          id?: string
          reasoning?: string | null
          recommendations?: Json
          user_id?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          drill_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          drill_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          drill_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      player_profiles: {
        Row: {
          coach_style: string
          commitment_level: string
          created_at: string
          days_per_week: number
          equipment: string[]
          goals: string[]
          id: string
          session_length: number
          skill_level: string
          subscription_status: string
          tier: string
          training_days: string[] | null
          trial_started_at: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          coach_style?: string
          commitment_level?: string
          created_at?: string
          days_per_week?: number
          equipment?: string[]
          goals?: string[]
          id?: string
          session_length?: number
          skill_level?: string
          subscription_status?: string
          tier?: string
          training_days?: string[] | null
          trial_started_at?: string
          updated_at?: string
          user_id: string
          username?: string
        }
        Update: {
          coach_style?: string
          commitment_level?: string
          created_at?: string
          days_per_week?: number
          equipment?: string[]
          goals?: string[]
          id?: string
          session_length?: number
          skill_level?: string
          subscription_status?: string
          tier?: string
          training_days?: string[] | null
          trial_started_at?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      player_stats: {
        Row: {
          achievements: string[]
          created_at: string
          current_streak: number
          id: string
          last_workout_date: string | null
          level: number
          level_title: string
          longest_streak: number
          skill_ratings: Json
          total_drills_completed: number
          total_training_minutes: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          achievements?: string[]
          created_at?: string
          current_streak?: number
          id?: string
          last_workout_date?: string | null
          level?: number
          level_title?: string
          longest_streak?: number
          skill_ratings?: Json
          total_drills_completed?: number
          total_training_minutes?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          achievements?: string[]
          created_at?: string
          current_streak?: number
          id?: string
          last_workout_date?: string | null
          level?: number
          level_title?: string
          longest_streak?: number
          skill_ratings?: Json
          total_drills_completed?: number
          total_training_minutes?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          username?: string | null
        }
        Relationships: []
      }
      weekly_plans: {
        Row: {
          created_at: string
          days: Json
          generated_at: string
          id: string
          user_id: string
          week_of: string
        }
        Insert: {
          created_at?: string
          days?: Json
          generated_at?: string
          id?: string
          user_id: string
          week_of: string
        }
        Update: {
          created_at?: string
          days?: Json
          generated_at?: string
          id?: string
          user_id?: string
          week_of?: string
        }
        Relationships: []
      }
      workout_sessions: {
        Row: {
          completed: boolean
          created_at: string
          date: string
          drills: Json
          id: string
          total_xp_earned: number
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          date?: string
          drills?: Json
          id?: string
          total_xp_earned?: number
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          date?: string
          drills?: Json
          id?: string
          total_xp_earned?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
