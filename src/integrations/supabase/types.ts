export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      body_measurements: {
        Row: {
          body_fat: number | null
          chest: number | null
          created_at: string
          height: number | null
          hip: number | null
          id: string
          left_bicep: number | null
          left_calf: number | null
          left_forearm: number | null
          left_thigh: number | null
          measurement_date: string
          notes: string | null
          right_bicep: number | null
          right_calf: number | null
          right_forearm: number | null
          right_thigh: number | null
          updated_at: string
          user_id: string
          waist: number | null
          weight: number | null
        }
        Insert: {
          body_fat?: number | null
          chest?: number | null
          created_at?: string
          height?: number | null
          hip?: number | null
          id?: string
          left_bicep?: number | null
          left_calf?: number | null
          left_forearm?: number | null
          left_thigh?: number | null
          measurement_date?: string
          notes?: string | null
          right_bicep?: number | null
          right_calf?: number | null
          right_forearm?: number | null
          right_thigh?: number | null
          updated_at?: string
          user_id: string
          waist?: number | null
          weight?: number | null
        }
        Update: {
          body_fat?: number | null
          chest?: number | null
          created_at?: string
          height?: number | null
          hip?: number | null
          id?: string
          left_bicep?: number | null
          left_calf?: number | null
          left_forearm?: number | null
          left_thigh?: number | null
          measurement_date?: string
          notes?: string | null
          right_bicep?: number | null
          right_calf?: number | null
          right_forearm?: number | null
          right_thigh?: number | null
          updated_at?: string
          user_id?: string
          waist?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      goal_progress: {
        Row: {
          created_at: string
          date: string
          goal_id: string
          id: string
          notes: string | null
          value: number
        }
        Insert: {
          created_at?: string
          date?: string
          goal_id: string
          id?: string
          notes?: string | null
          value: number
        }
        Update: {
          created_at?: string
          date?: string
          goal_id?: string
          id?: string
          notes?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "goal_progress_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "user_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          category: Database["public"]["Enums"]["goal_category"]
          completed: boolean
          completed_at: string | null
          created_at: string
          current_value: number
          deadline: string | null
          description: string | null
          frequency_period: string | null
          frequency_target: number | null
          goal_type: Database["public"]["Enums"]["goal_type"]
          id: string
          metadata: Json | null
          priority: Database["public"]["Enums"]["goal_priority"]
          start_date: string
          target_value: number
          title: string
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["goal_category"]
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_value?: number
          deadline?: string | null
          description?: string | null
          frequency_period?: string | null
          frequency_target?: number | null
          goal_type?: Database["public"]["Enums"]["goal_type"]
          id?: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["goal_priority"]
          start_date?: string
          target_value: number
          title: string
          unit: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["goal_category"]
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_value?: number
          deadline?: string | null
          description?: string | null
          frequency_period?: string | null
          frequency_target?: number | null
          goal_type?: Database["public"]["Enums"]["goal_type"]
          id?: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["goal_priority"]
          start_date?: string
          target_value?: number
          title?: string
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_sessions: {
        Row: {
          completion_percentage: number
          created_at: string | null
          date: string
          duration: number | null
          id: string
          notes: string | null
          user_id: string
          workout_id: string | null
        }
        Insert: {
          completion_percentage?: number
          created_at?: string | null
          date?: string
          duration?: number | null
          id?: string
          notes?: string | null
          user_id: string
          workout_id?: string | null
        }
        Update: {
          completion_percentage?: number
          created_at?: string | null
          date?: string
          duration?: number | null
          id?: string
          notes?: string | null
          user_id?: string
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          created_at: string | null
          description: string | null
          exercises: Json | null
          expiration_date: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
          weekly_schedule: Json | null
          workout_days: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          exercises?: Json | null
          expiration_date?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
          weekly_schedule?: Json | null
          workout_days?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          exercises?: Json | null
          expiration_date?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
          weekly_schedule?: Json | null
          workout_days?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      validate_exercise_structure: {
        Args: { exercise_data: Json }
        Returns: boolean
      }
    }
    Enums: {
      goal_category:
        | "strength"
        | "cardio"
        | "weight"
        | "habit"
        | "endurance"
        | "flexibility"
        | "nutrition"
        | "other"
      goal_priority: "high" | "medium" | "low"
      goal_type: "numeric" | "time" | "boolean" | "frequency"
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
    Enums: {
      goal_category: [
        "strength",
        "cardio",
        "weight",
        "habit",
        "endurance",
        "flexibility",
        "nutrition",
        "other",
      ],
      goal_priority: ["high", "medium", "low"],
      goal_type: ["numeric", "time", "boolean", "frequency"],
    },
  },
} as const
