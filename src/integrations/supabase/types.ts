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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          child_id: string
          completed_at: string
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          name: string
          points_value: number
          type: string
          verified_by: string | null
        }
        Insert: {
          child_id: string
          completed_at?: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          points_value?: number
          type: string
          verified_by?: string | null
        }
        Update: {
          child_id?: string
          completed_at?: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          points_value?: number
          type?: string
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_analytics_view"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "activities_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          icon_url: string | null
          id: string
          name: string
          points_reward: number
          points_value: number | null
          rarity: string
          requirements: Json
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          icon_url?: string | null
          id?: string
          name: string
          points_reward?: number
          points_value?: number | null
          rarity?: string
          requirements?: Json
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          icon_url?: string | null
          id?: string
          name?: string
          points_reward?: number
          points_value?: number | null
          rarity?: string
          requirements?: Json
        }
        Relationships: []
      }
      child_badges: {
        Row: {
          badge_id: string
          child_id: string
          earned_at: string
          id: string
        }
        Insert: {
          badge_id: string
          child_id: string
          earned_at?: string
          id?: string
        }
        Update: {
          badge_id?: string
          child_id?: string
          earned_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_badges_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_analytics_view"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "child_badges_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          avatar_url: string | null
          companion_name: string
          companion_type: string
          created_at: string | null
          current_streak: number | null
          date_of_birth: string | null
          family_id: string
          gender: string | null
          id: string
          islamic_level: number | null
          login_email: string | null
          login_password: string | null
          longest_streak: number | null
          name: string
          preferences: Json | null
          total_points: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          companion_name?: string
          companion_type?: string
          created_at?: string | null
          current_streak?: number | null
          date_of_birth?: string | null
          family_id: string
          gender?: string | null
          id?: string
          islamic_level?: number | null
          login_email?: string | null
          login_password?: string | null
          longest_streak?: number | null
          name: string
          preferences?: Json | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          companion_name?: string
          companion_type?: string
          created_at?: string | null
          current_streak?: number | null
          date_of_birth?: string | null
          family_id?: string
          gender?: string | null
          id?: string
          islamic_level?: number | null
          login_email?: string | null
          login_password?: string | null
          longest_streak?: number | null
          name?: string
          preferences?: Json | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "children_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "children_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      companion_conversations: {
        Row: {
          child_id: string
          companion_personality: string
          context_data: Json | null
          created_at: string
          id: string
          message_content: string
          message_type: string
          updated_at: string
        }
        Insert: {
          child_id: string
          companion_personality?: string
          context_data?: Json | null
          created_at?: string
          id?: string
          message_content: string
          message_type: string
          updated_at?: string
        }
        Update: {
          child_id?: string
          companion_personality?: string
          context_data?: Json | null
          created_at?: string
          id?: string
          message_content?: string
          message_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      companion_daily_content: {
        Row: {
          child_id: string
          content_data: Json | null
          content_text: string
          content_title: string | null
          content_type: string
          created_at: string
          date_created: string
          id: string
          is_delivered: boolean | null
        }
        Insert: {
          child_id: string
          content_data?: Json | null
          content_text: string
          content_title?: string | null
          content_type: string
          created_at?: string
          date_created?: string
          id?: string
          is_delivered?: boolean | null
        }
        Update: {
          child_id?: string
          content_data?: Json | null
          content_text?: string
          content_title?: string | null
          content_type?: string
          created_at?: string
          date_created?: string
          id?: string
          is_delivered?: boolean | null
        }
        Relationships: []
      }
      families: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      family_members: {
        Row: {
          family_id: string
          id: string
          joined_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          family_id: string
          id?: string
          joined_at?: string | null
          role?: string
          user_id: string
        }
        Update: {
          family_id?: string
          id?: string
          joined_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          child_id: string
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          current_value: number | null
          deadline: string | null
          description: string | null
          goal_type: string
          id: string
          reward_points: number
          target_value: number
          title: string
          updated_at: string | null
        }
        Insert: {
          child_id: string
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          current_value?: number | null
          deadline?: string | null
          description?: string | null
          goal_type: string
          id?: string
          reward_points?: number
          target_value: number
          title: string
          updated_at?: string | null
        }
        Update: {
          child_id?: string
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          current_value?: number | null
          deadline?: string | null
          description?: string | null
          goal_type?: string
          id?: string
          reward_points?: number
          target_value?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goals_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_analytics_view"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "goals_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_times: {
        Row: {
          child_id: string
          completed_at: string | null
          created_at: string | null
          id: string
          on_time: boolean | null
          points_earned: number | null
          prayer_date: string
          prayer_name: string
          scheduled_time: string
        }
        Insert: {
          child_id: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          on_time?: boolean | null
          points_earned?: number | null
          prayer_date?: string
          prayer_name: string
          scheduled_time?: string
        }
        Update: {
          child_id?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          on_time?: boolean | null
          points_earned?: number | null
          prayer_date?: string
          prayer_name?: string
          scheduled_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "prayer_times_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_analytics_view"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "prayer_times_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      quran_progress: {
        Row: {
          child_id: string
          completion_percentage: number | null
          created_at: string | null
          id: string
          last_practiced_at: string | null
          mastery_level: string | null
          notes: string | null
          surah_name: string
          surah_number: number
          total_verses: number
          updated_at: string | null
          verses_memorized: number | null
        }
        Insert: {
          child_id: string
          completion_percentage?: number | null
          created_at?: string | null
          id?: string
          last_practiced_at?: string | null
          mastery_level?: string | null
          notes?: string | null
          surah_name: string
          surah_number: number
          total_verses: number
          updated_at?: string | null
          verses_memorized?: number | null
        }
        Update: {
          child_id?: string
          completion_percentage?: number | null
          created_at?: string | null
          id?: string
          last_practiced_at?: string | null
          mastery_level?: string | null
          notes?: string | null
          surah_name?: string
          surah_number?: number
          total_verses?: number
          updated_at?: string | null
          verses_memorized?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quran_progress_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_analytics_view"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "quran_progress_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_claims: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          child_id: string
          claimed_at: string
          id: string
          notes: string | null
          reward_id: string
          status: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          child_id: string
          claimed_at?: string
          id?: string
          notes?: string | null
          reward_id: string
          status?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          child_id?: string
          claimed_at?: string
          id?: string
          notes?: string | null
          reward_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_claims_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_claims_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_analytics_view"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "reward_claims_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_claims_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          family_id: string
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          points_required: number
          target_children: string[] | null
          target_type: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          family_id: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          points_required: number
          target_children?: string[] | null
          target_type?: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          family_id?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          points_required?: number
          target_children?: string[] | null
          target_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rewards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          age_group: string
          audio_url: string | null
          category: string | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          image_url: string | null
          moral: string | null
          published_at: string | null
          reading_time: number | null
          scheduled_for: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          age_group?: string
          audio_url?: string | null
          category?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string | null
          moral?: string | null
          published_at?: string | null
          reading_time?: number | null
          scheduled_for?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          age_group?: string
          audio_url?: string | null
          category?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string | null
          moral?: string | null
          published_at?: string | null
          reading_time?: number | null
          scheduled_for?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      story_progress: {
        Row: {
          child_id: string
          completed_at: string
          id: string
          notes: string | null
          reaction: string | null
          story_id: string
        }
        Insert: {
          child_id: string
          completed_at?: string
          id?: string
          notes?: string | null
          reaction?: string | null
          story_id: string
        }
        Update: {
          child_id?: string
          completed_at?: string
          id?: string
          notes?: string | null
          reaction?: string | null
          story_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_progress_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_analytics_view"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "story_progress_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_progress_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          family_id: string | null
          full_name: string
          id: string
          role: string
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          family_id?: string | null
          full_name: string
          id: string
          role?: string
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          family_id?: string | null
          full_name?: string
          id?: string
          role?: string
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      child_analytics_view: {
        Row: {
          badges_earned: number | null
          child_id: string | null
          current_streak: number | null
          longest_streak: number | null
          name: string | null
          prayer_completion_rate: number | null
          quran_verses_memorized: number | null
          stories_completed: number | null
          total_activities: number | null
          total_points: number | null
          weekly_points: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_prayer_streak: {
        Args: { child_id: string }
        Returns: number
      }
      check_and_award_badges: {
        Args: { child_id: string }
        Returns: Json
      }
      get_child_analytics: {
        Args: { child_id: string }
        Returns: Json
      }
      get_child_prayer_completion_rate: {
        Args: { child_uuid: string; days_back?: number }
        Returns: number
      }
      get_child_quran_verses_memorized: {
        Args: { child_uuid: string }
        Returns: number
      }
      get_child_weekly_points: {
        Args: { child_uuid: string }
        Returns: number
      }
      get_family_analytics: {
        Args: { family_id: string }
        Returns: Json
      }
      get_islamic_date: {
        Args: { gregorian_date?: string }
        Returns: Json
      }
      get_user_family_id: {
        Args: { user_id: string }
        Returns: string
      }
      is_parent: {
        Args: { user_id: string }
        Returns: boolean
      }
      update_child_points: {
        Args: { child_id: string; points_to_add: number }
        Returns: undefined
      }
      update_child_streak: {
        Args: { child_id: string }
        Returns: number
      }
    }
    Enums: {
      activity_type:
        | "prayer"
        | "quran"
        | "good_deed"
        | "story"
        | "dua"
        | "charity"
      reward_status: "pending" | "earned" | "claimed"
      story_status: "draft" | "scheduled" | "published" | "archived"
      user_role: "parent" | "child" | "admin"
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
      activity_type: [
        "prayer",
        "quran",
        "good_deed",
        "story",
        "dua",
        "charity",
      ],
      reward_status: ["pending", "earned", "claimed"],
      story_status: ["draft", "scheduled", "published", "archived"],
      user_role: ["parent", "child", "admin"],
    },
  },
} as const
