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
      ai_achievement_suggestions: {
        Row: {
          child_id: string
          created_at: string
          family_id: string
          id: string
          implemented: boolean | null
          suggestion_data: Json
        }
        Insert: {
          child_id: string
          created_at?: string
          family_id: string
          id?: string
          implemented?: boolean | null
          suggestion_data: Json
        }
        Update: {
          child_id?: string
          created_at?: string
          family_id?: string
          id?: string
          implemented?: boolean | null
          suggestion_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "ai_achievement_suggestions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_analytics_view"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "ai_achievement_suggestions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_achievement_suggestions_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
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
      child_companion_config: {
        Row: {
          child_id: string
          created_at: string
          customizations: Json | null
          effectiveness_metrics: Json | null
          id: string
          last_adapted_at: string | null
          personality_id: string
          updated_at: string
        }
        Insert: {
          child_id: string
          created_at?: string
          customizations?: Json | null
          effectiveness_metrics?: Json | null
          id?: string
          last_adapted_at?: string | null
          personality_id: string
          updated_at?: string
        }
        Update: {
          child_id?: string
          created_at?: string
          customizations?: Json | null
          effectiveness_metrics?: Json | null
          id?: string
          last_adapted_at?: string | null
          personality_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_companion_config_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: true
            referencedRelation: "child_analytics_view"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "child_companion_config_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: true
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_companion_config_personality_id_fkey"
            columns: ["personality_id"]
            isOneToOne: false
            referencedRelation: "islamic_companion_personalities"
            referencedColumns: ["id"]
          },
        ]
      }
      child_islamic_analytics: {
        Row: {
          ai_insights: Json | null
          analysis_date: string | null
          areas_for_improvement: Json | null
          child_id: string
          created_at: string | null
          engagement_metrics: Json
          id: string
          knowledge_retention_rate: number | null
          learning_patterns: Json
          optimal_activity_suggestions: Json | null
          practice_consistency_score: number | null
          preferred_learning_times: Json | null
          recommended_interventions: Json | null
          reviewed_by_scholar: string | null
          scholar_notes: string | null
          scholar_review_status: string | null
          spiritual_development_score: number | null
          strengths_identified: Json | null
          updated_at: string | null
        }
        Insert: {
          ai_insights?: Json | null
          analysis_date?: string | null
          areas_for_improvement?: Json | null
          child_id: string
          created_at?: string | null
          engagement_metrics: Json
          id?: string
          knowledge_retention_rate?: number | null
          learning_patterns: Json
          optimal_activity_suggestions?: Json | null
          practice_consistency_score?: number | null
          preferred_learning_times?: Json | null
          recommended_interventions?: Json | null
          reviewed_by_scholar?: string | null
          scholar_notes?: string | null
          scholar_review_status?: string | null
          spiritual_development_score?: number | null
          strengths_identified?: Json | null
          updated_at?: string | null
        }
        Update: {
          ai_insights?: Json | null
          analysis_date?: string | null
          areas_for_improvement?: Json | null
          child_id?: string
          created_at?: string | null
          engagement_metrics?: Json
          id?: string
          knowledge_retention_rate?: number | null
          learning_patterns?: Json
          optimal_activity_suggestions?: Json | null
          practice_consistency_score?: number | null
          preferred_learning_times?: Json | null
          recommended_interventions?: Json | null
          reviewed_by_scholar?: string | null
          scholar_notes?: string | null
          scholar_review_status?: string | null
          spiritual_development_score?: number | null
          strengths_identified?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      child_islamic_milestones: {
        Row: {
          achievement_id: string
          celebration_viewed: boolean | null
          child_id: string
          created_at: string
          earned_at: string | null
          id: string
          notes: string | null
          progress_percentage: number | null
          updated_at: string
        }
        Insert: {
          achievement_id: string
          celebration_viewed?: boolean | null
          child_id: string
          created_at?: string
          earned_at?: string | null
          id?: string
          notes?: string | null
          progress_percentage?: number | null
          updated_at?: string
        }
        Update: {
          achievement_id?: string
          celebration_viewed?: boolean | null
          child_id?: string
          created_at?: string
          earned_at?: string | null
          id?: string
          notes?: string | null
          progress_percentage?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_islamic_milestones_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "islamic_achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_islamic_milestones_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_analytics_view"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "child_islamic_milestones_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      child_spiritual_patterns: {
        Row: {
          child_id: string
          confidence_score: number | null
          created_at: string
          id: string
          observed_at: string
          pattern_data: Json
          pattern_type: string
        }
        Insert: {
          child_id: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          observed_at?: string
          pattern_data?: Json
          pattern_type: string
        }
        Update: {
          child_id?: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          observed_at?: string
          pattern_data?: Json
          pattern_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_spiritual_patterns_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_analytics_view"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "child_spiritual_patterns_child_id_fkey"
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
          islamic_profile: Json | null
          learning_schedule: Json | null
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
          islamic_profile?: Json | null
          learning_schedule?: Json | null
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
          islamic_profile?: Json | null
          learning_schedule?: Json | null
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
      collaborative_islamic_goals: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          family_id: string
          goal_type: string
          id: string
          islamic_significance: string | null
          milestones: Json | null
          parent_guidance: Json | null
          progress_tracking: Json | null
          rewards: Json | null
          start_date: string | null
          status: string | null
          target_date: string
          target_participants: Json
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          family_id: string
          goal_type: string
          id?: string
          islamic_significance?: string | null
          milestones?: Json | null
          parent_guidance?: Json | null
          progress_tracking?: Json | null
          rewards?: Json | null
          start_date?: string | null
          status?: string | null
          target_date: string
          target_participants: Json
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          family_id?: string
          goal_type?: string
          id?: string
          islamic_significance?: string | null
          milestones?: Json | null
          parent_guidance?: Json | null
          progress_tracking?: Json | null
          rewards?: Json | null
          start_date?: string | null
          status?: string | null
          target_date?: string
          target_participants?: Json
          title?: string
          updated_at?: string | null
        }
        Relationships: []
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
      extended_family_sharing: {
        Row: {
          accepted_at: string | null
          child_id: string
          created_at: string | null
          extended_member_email: string
          extended_member_name: string
          family_id: string
          id: string
          invite_status: string | null
          invited_at: string | null
          invited_by: string
          islamic_content_filter: Json | null
          permission_level: string | null
          relationship: string
          shared_content_types: Json | null
        }
        Insert: {
          accepted_at?: string | null
          child_id: string
          created_at?: string | null
          extended_member_email: string
          extended_member_name: string
          family_id: string
          id?: string
          invite_status?: string | null
          invited_at?: string | null
          invited_by: string
          islamic_content_filter?: Json | null
          permission_level?: string | null
          relationship: string
          shared_content_types?: Json | null
        }
        Update: {
          accepted_at?: string | null
          child_id?: string
          created_at?: string | null
          extended_member_email?: string
          extended_member_name?: string
          family_id?: string
          id?: string
          invite_status?: string | null
          invited_at?: string | null
          invited_by?: string
          islamic_content_filter?: Json | null
          permission_level?: string | null
          relationship?: string
          shared_content_types?: Json | null
        }
        Relationships: []
      }
      families: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          islamic_settings: Json | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          islamic_settings?: Json | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          islamic_settings?: Json | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      family_islamic_calendar: {
        Row: {
          celebration_activities: Json | null
          created_at: string | null
          created_by: string
          description: string | null
          educational_content: Json | null
          event_date: string
          event_time: string | null
          event_type: string
          family_id: string
          id: string
          is_family_wide: boolean | null
          islamic_significance: string | null
          participants: Json | null
          preparation_tasks: Json | null
          privacy_level: string | null
          recurrence_pattern: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          celebration_activities?: Json | null
          created_at?: string | null
          created_by: string
          description?: string | null
          educational_content?: Json | null
          event_date: string
          event_time?: string | null
          event_type: string
          family_id: string
          id?: string
          is_family_wide?: boolean | null
          islamic_significance?: string | null
          participants?: Json | null
          preparation_tasks?: Json | null
          privacy_level?: string | null
          recurrence_pattern?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          celebration_activities?: Json | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          educational_content?: Json | null
          event_date?: string
          event_time?: string | null
          event_type?: string
          family_id?: string
          id?: string
          is_family_wide?: boolean | null
          islamic_significance?: string | null
          participants?: Json | null
          preparation_tasks?: Json | null
          privacy_level?: string | null
          recurrence_pattern?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      family_islamic_challenges: {
        Row: {
          challenge_type: string
          created_at: string
          created_by_ai: boolean | null
          description: string
          educational_content: Json | null
          end_date: string
          family_id: string
          goals: Json | null
          id: string
          is_active: boolean | null
          name_arabic: string | null
          name_english: string
          start_date: string
          success_celebration: Json | null
          updated_at: string
        }
        Insert: {
          challenge_type: string
          created_at?: string
          created_by_ai?: boolean | null
          description: string
          educational_content?: Json | null
          end_date: string
          family_id: string
          goals?: Json | null
          id?: string
          is_active?: boolean | null
          name_arabic?: string | null
          name_english: string
          start_date: string
          success_celebration?: Json | null
          updated_at?: string
        }
        Update: {
          challenge_type?: string
          created_at?: string
          created_by_ai?: boolean | null
          description?: string
          educational_content?: Json | null
          end_date?: string
          family_id?: string
          goals?: Json | null
          id?: string
          is_active?: boolean | null
          name_arabic?: string | null
          name_english?: string
          start_date?: string
          success_celebration?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_islamic_challenges_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      family_islamic_insights: {
        Row: {
          actionable_recommendations: string[] | null
          confidence_level: number | null
          created_at: string
          family_id: string
          generated_at: string
          id: string
          insight_data: Json
          insight_type: string
          is_active: boolean | null
        }
        Insert: {
          actionable_recommendations?: string[] | null
          confidence_level?: number | null
          created_at?: string
          family_id: string
          generated_at?: string
          id?: string
          insight_data?: Json
          insight_type: string
          is_active?: boolean | null
        }
        Update: {
          actionable_recommendations?: string[] | null
          confidence_level?: number | null
          created_at?: string
          family_id?: string
          generated_at?: string
          id?: string
          insight_data?: Json
          insight_type?: string
          is_active?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "family_islamic_insights_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      family_islamic_preferences: {
        Row: {
          created_at: string | null
          family_id: string
          hijri_calendar_preference: Json | null
          id: string
          learning_preferences: Json | null
          prayer_method_id: string | null
          preferred_language: string | null
          qibla_direction: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          family_id: string
          hijri_calendar_preference?: Json | null
          id?: string
          learning_preferences?: Json | null
          prayer_method_id?: string | null
          preferred_language?: string | null
          qibla_direction?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          family_id?: string
          hijri_calendar_preference?: Json | null
          id?: string
          learning_preferences?: Json | null
          prayer_method_id?: string | null
          preferred_language?: string | null
          qibla_direction?: number | null
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
      family_prayer_sync: {
        Row: {
          created_at: string | null
          created_by: string
          family_id: string
          id: string
          islamic_reminders: Json | null
          participants: Json | null
          prayer_name: string
          scheduled_time: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          family_id: string
          id?: string
          islamic_reminders?: Json | null
          participants?: Json | null
          prayer_name: string
          scheduled_time: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          family_id?: string
          id?: string
          islamic_reminders?: Json | null
          participants?: Json | null
          prayer_name?: string
          scheduled_time?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      family_story_approvals: {
        Row: {
          approval_notes: string | null
          approval_status: string
          approved_by: string
          child_restrictions: Json | null
          created_at: string
          family_id: string
          id: string
          story_id: string
          updated_at: string
        }
        Insert: {
          approval_notes?: string | null
          approval_status?: string
          approved_by: string
          child_restrictions?: Json | null
          created_at?: string
          family_id: string
          id?: string
          story_id: string
          updated_at?: string
        }
        Update: {
          approval_notes?: string | null
          approval_status?: string
          approved_by?: string
          child_restrictions?: Json | null
          created_at?: string
          family_id?: string
          id?: string
          story_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_story_approvals_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      family_story_recordings: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          audio_url: string | null
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          family_id: string
          id: string
          is_approved: boolean | null
          islamic_lessons: Json | null
          islamic_theme: string | null
          listen_count: number | null
          privacy_level: string | null
          recorded_by: string
          target_children: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          audio_url?: string | null
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          family_id: string
          id?: string
          is_approved?: boolean | null
          islamic_lessons?: Json | null
          islamic_theme?: string | null
          listen_count?: number | null
          privacy_level?: string | null
          recorded_by: string
          target_children?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          audio_url?: string | null
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          family_id?: string
          id?: string
          is_approved?: boolean | null
          islamic_lessons?: Json | null
          islamic_theme?: string | null
          listen_count?: number | null
          privacy_level?: string | null
          recorded_by?: string
          target_children?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
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
      islamic_achievement_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string
          id: string
          name_arabic: string
          name_english: string
          name_transliteration: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon: string
          id?: string
          name_arabic: string
          name_english: string
          name_transliteration: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name_arabic?: string
          name_english?: string
          name_transliteration?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      islamic_achievement_criteria: {
        Row: {
          achievement_id: string
          comparison_operator: string | null
          created_at: string
          criterion_type: string
          id: string
          target_value: number
        }
        Insert: {
          achievement_id: string
          comparison_operator?: string | null
          created_at?: string
          criterion_type: string
          id?: string
          target_value: number
        }
        Update: {
          achievement_id?: string
          comparison_operator?: string | null
          created_at?: string
          criterion_type?: string
          id?: string
          target_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "islamic_achievement_criteria_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "islamic_achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      islamic_achievements: {
        Row: {
          age_maximum: number | null
          age_minimum: number | null
          category_id: string
          celebration_dua: string | null
          celebration_dua_translation: string | null
          created_at: string
          description_arabic: string | null
          description_english: string
          difficulty_level: number | null
          id: string
          name_arabic: string
          name_english: string
          name_transliteration: string
          points_reward: number | null
          required_actions: Json | null
          updated_at: string
        }
        Insert: {
          age_maximum?: number | null
          age_minimum?: number | null
          category_id: string
          celebration_dua?: string | null
          celebration_dua_translation?: string | null
          created_at?: string
          description_arabic?: string | null
          description_english: string
          difficulty_level?: number | null
          id?: string
          name_arabic: string
          name_english: string
          name_transliteration: string
          points_reward?: number | null
          required_actions?: Json | null
          updated_at?: string
        }
        Update: {
          age_maximum?: number | null
          age_minimum?: number | null
          category_id?: string
          celebration_dua?: string | null
          celebration_dua_translation?: string | null
          created_at?: string
          description_arabic?: string | null
          description_english?: string
          difficulty_level?: number | null
          id?: string
          name_arabic?: string
          name_english?: string
          name_transliteration?: string
          points_reward?: number | null
          required_actions?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "islamic_achievements_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "islamic_achievement_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      islamic_celebrations: {
        Row: {
          animation_type: string | null
          created_at: string
          dua_arabic: string
          dua_translation: string
          id: string
          name: string
          occasion_type: string | null
          sound_effect: string | null
        }
        Insert: {
          animation_type?: string | null
          created_at?: string
          dua_arabic: string
          dua_translation: string
          id?: string
          name: string
          occasion_type?: string | null
          sound_effect?: string | null
        }
        Update: {
          animation_type?: string | null
          created_at?: string
          dua_arabic?: string
          dua_translation?: string
          id?: string
          name?: string
          occasion_type?: string | null
          sound_effect?: string | null
        }
        Relationships: []
      }
      islamic_companion_personalities: {
        Row: {
          age_suitability: string | null
          created_at: string
          description: string
          id: string
          interaction_patterns: Json | null
          islamic_characteristics: Json | null
          motivation_style: string
          name: string
          personality_traits: Json
          preferred_content_types: string[] | null
        }
        Insert: {
          age_suitability?: string | null
          created_at?: string
          description: string
          id?: string
          interaction_patterns?: Json | null
          islamic_characteristics?: Json | null
          motivation_style: string
          name: string
          personality_traits?: Json
          preferred_content_types?: string[] | null
        }
        Update: {
          age_suitability?: string | null
          created_at?: string
          description?: string
          id?: string
          interaction_patterns?: Json | null
          islamic_characteristics?: Json | null
          motivation_style?: string
          name?: string
          personality_traits?: Json
          preferred_content_types?: string[] | null
        }
        Relationships: []
      }
      islamic_curriculum_standards: {
        Row: {
          akhlaq_development: Json | null
          approval_date: string | null
          approved_by: string | null
          aqeedah_components: Json | null
          assessment_rubric: Json
          created_at: string | null
          cross_curricular_connections: Json | null
          cultural_adaptations: Json | null
          fiqh_elements: Json | null
          grade_level: number
          hadith_foundations: Json | null
          id: string
          international_alignment: string | null
          learning_objective: string
          local_community_input: Json | null
          progression_pathway: Json | null
          quranic_foundations: Json | null
          scholar_approved: boolean | null
          skill_competencies: Json
          standard_name: string
          subject_area: string
          updated_at: string | null
        }
        Insert: {
          akhlaq_development?: Json | null
          approval_date?: string | null
          approved_by?: string | null
          aqeedah_components?: Json | null
          assessment_rubric: Json
          created_at?: string | null
          cross_curricular_connections?: Json | null
          cultural_adaptations?: Json | null
          fiqh_elements?: Json | null
          grade_level: number
          hadith_foundations?: Json | null
          id?: string
          international_alignment?: string | null
          learning_objective: string
          local_community_input?: Json | null
          progression_pathway?: Json | null
          quranic_foundations?: Json | null
          scholar_approved?: boolean | null
          skill_competencies: Json
          standard_name: string
          subject_area: string
          updated_at?: string | null
        }
        Update: {
          akhlaq_development?: Json | null
          approval_date?: string | null
          approved_by?: string | null
          aqeedah_components?: Json | null
          assessment_rubric?: Json
          created_at?: string | null
          cross_curricular_connections?: Json | null
          cultural_adaptations?: Json | null
          fiqh_elements?: Json | null
          grade_level?: number
          hadith_foundations?: Json | null
          id?: string
          international_alignment?: string | null
          learning_objective?: string
          local_community_input?: Json | null
          progression_pathway?: Json | null
          quranic_foundations?: Json | null
          scholar_approved?: boolean | null
          skill_competencies?: Json
          standard_name?: string
          subject_area?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      islamic_education_scholars: {
        Row: {
          bio: string | null
          certifications: Json | null
          contact_email: string | null
          created_at: string | null
          credentials: string
          educational_background: string | null
          id: string
          is_active: boolean | null
          islamic_methodology_expertise: string | null
          languages_spoken: Json | null
          scholar_name: string
          scholarly_works: Json | null
          specializations: Json | null
          updated_at: string | null
          user_id: string
          verification_status: string | null
          years_experience: number | null
        }
        Insert: {
          bio?: string | null
          certifications?: Json | null
          contact_email?: string | null
          created_at?: string | null
          credentials: string
          educational_background?: string | null
          id?: string
          is_active?: boolean | null
          islamic_methodology_expertise?: string | null
          languages_spoken?: Json | null
          scholar_name: string
          scholarly_works?: Json | null
          specializations?: Json | null
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
          years_experience?: number | null
        }
        Update: {
          bio?: string | null
          certifications?: Json | null
          contact_email?: string | null
          created_at?: string | null
          credentials?: string
          educational_background?: string | null
          id?: string
          is_active?: boolean | null
          islamic_methodology_expertise?: string | null
          languages_spoken?: Json | null
          scholar_name?: string
          scholarly_works?: Json | null
          specializations?: Json | null
          updated_at?: string | null
          user_id?: string
          verification_status?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      islamic_educators: {
        Row: {
          approval_level: string | null
          contact_email: string | null
          created_at: string
          credentials: string
          id: string
          is_active: boolean | null
          name: string
          specialization: Json | null
          updated_at: string
          user_id: string
          verification_status: string | null
        }
        Insert: {
          approval_level?: string | null
          contact_email?: string | null
          created_at?: string
          credentials: string
          id?: string
          is_active?: boolean | null
          name: string
          specialization?: Json | null
          updated_at?: string
          user_id: string
          verification_status?: string | null
        }
        Update: {
          approval_level?: string | null
          contact_email?: string | null
          created_at?: string
          credentials?: string
          id?: string
          is_active?: boolean | null
          name?: string
          specialization?: Json | null
          updated_at?: string
          user_id?: string
          verification_status?: string | null
        }
        Relationships: []
      }
      islamic_encouragements: {
        Row: {
          child_id: string
          child_response: string | null
          content_id: string
          created_at: string
          delivered_at: string
          effectiveness_score: number | null
          id: string
          personalization_data: Json | null
          trigger_reason: string
        }
        Insert: {
          child_id: string
          child_response?: string | null
          content_id: string
          created_at?: string
          delivered_at?: string
          effectiveness_score?: number | null
          id?: string
          personalization_data?: Json | null
          trigger_reason: string
        }
        Update: {
          child_id?: string
          child_response?: string | null
          content_id?: string
          created_at?: string
          delivered_at?: string
          effectiveness_score?: number | null
          id?: string
          personalization_data?: Json | null
          trigger_reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "islamic_encouragements_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_analytics_view"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "islamic_encouragements_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "islamic_encouragements_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "islamic_motivational_content"
            referencedColumns: ["id"]
          },
        ]
      }
      islamic_family_messages: {
        Row: {
          created_at: string | null
          family_id: string
          id: string
          is_family_wide: boolean | null
          islamic_emoji_used: Json | null
          islamic_etiquette_score: number | null
          islamic_expressions: Json | null
          message_content: string
          message_type: string | null
          parent_approved: boolean | null
          read_by: Json | null
          recipient_ids: Json
          reply_to: string | null
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          family_id: string
          id?: string
          is_family_wide?: boolean | null
          islamic_emoji_used?: Json | null
          islamic_etiquette_score?: number | null
          islamic_expressions?: Json | null
          message_content: string
          message_type?: string | null
          parent_approved?: boolean | null
          read_by?: Json | null
          recipient_ids: Json
          reply_to?: string | null
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          family_id?: string
          id?: string
          is_family_wide?: boolean | null
          islamic_emoji_used?: Json | null
          islamic_etiquette_score?: number | null
          islamic_expressions?: Json | null
          message_content?: string
          message_type?: string | null
          parent_approved?: boolean | null
          read_by?: Json | null
          recipient_ids?: Json
          reply_to?: string | null
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      islamic_intervention_strategies: {
        Row: {
          created_at: string | null
          cultural_sensitivity_notes: string | null
          duration_guidelines: string | null
          effectiveness_metrics: Json | null
          expected_outcomes: Json | null
          family_involvement_required: boolean | null
          hadith_basis: Json | null
          id: string
          implementation_steps: Json
          islamic_methodology: string
          quranic_basis: Json | null
          scholar_validated: boolean | null
          scholarly_references: Json | null
          strategy_description: string
          strategy_name: string
          success_rate: number | null
          target_age_group: string
          trigger_conditions: Json
          updated_at: string | null
          usage_frequency: number | null
          validated_by: string | null
          validation_date: string | null
        }
        Insert: {
          created_at?: string | null
          cultural_sensitivity_notes?: string | null
          duration_guidelines?: string | null
          effectiveness_metrics?: Json | null
          expected_outcomes?: Json | null
          family_involvement_required?: boolean | null
          hadith_basis?: Json | null
          id?: string
          implementation_steps: Json
          islamic_methodology: string
          quranic_basis?: Json | null
          scholar_validated?: boolean | null
          scholarly_references?: Json | null
          strategy_description: string
          strategy_name: string
          success_rate?: number | null
          target_age_group: string
          trigger_conditions: Json
          updated_at?: string | null
          usage_frequency?: number | null
          validated_by?: string | null
          validation_date?: string | null
        }
        Update: {
          created_at?: string | null
          cultural_sensitivity_notes?: string | null
          duration_guidelines?: string | null
          effectiveness_metrics?: Json | null
          expected_outcomes?: Json | null
          family_involvement_required?: boolean | null
          hadith_basis?: Json | null
          id?: string
          implementation_steps?: Json
          islamic_methodology?: string
          quranic_basis?: Json | null
          scholar_validated?: boolean | null
          scholarly_references?: Json | null
          strategy_description?: string
          strategy_name?: string
          success_rate?: number | null
          target_age_group?: string
          trigger_conditions?: Json
          updated_at?: string | null
          usage_frequency?: number | null
          validated_by?: string | null
          validation_date?: string | null
        }
        Relationships: []
      }
      islamic_learning_benchmarks: {
        Row: {
          age_group: string
          assessment_criteria: Json
          benchmark_description: string
          benchmark_name: string
          created_at: string | null
          created_by_scholar: string | null
          cultural_considerations: Json | null
          expected_competency_level: number
          hadith_references: Json | null
          id: string
          islamic_subject: string
          quranic_references: Json | null
          scholarly_sources: Json | null
          updated_at: string | null
          validation_status: string | null
        }
        Insert: {
          age_group: string
          assessment_criteria: Json
          benchmark_description: string
          benchmark_name: string
          created_at?: string | null
          created_by_scholar?: string | null
          cultural_considerations?: Json | null
          expected_competency_level: number
          hadith_references?: Json | null
          id?: string
          islamic_subject: string
          quranic_references?: Json | null
          scholarly_sources?: Json | null
          updated_at?: string | null
          validation_status?: string | null
        }
        Update: {
          age_group?: string
          assessment_criteria?: Json
          benchmark_description?: string
          benchmark_name?: string
          created_at?: string | null
          created_by_scholar?: string | null
          cultural_considerations?: Json | null
          expected_competency_level?: number
          hadith_references?: Json | null
          id?: string
          islamic_subject?: string
          quranic_references?: Json | null
          scholarly_sources?: Json | null
          updated_at?: string | null
          validation_status?: string | null
        }
        Relationships: []
      }
      islamic_learning_goals: {
        Row: {
          child_id: string
          created_at: string | null
          created_by: string | null
          current_value: number | null
          deadline: string | null
          description: string | null
          goal_type: string
          id: string
          priority: string | null
          status: string | null
          target_value: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          child_id: string
          created_at?: string | null
          created_by?: string | null
          current_value?: number | null
          deadline?: string | null
          description?: string | null
          goal_type: string
          id?: string
          priority?: string | null
          status?: string | null
          target_value?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string | null
          created_by?: string | null
          current_value?: number | null
          deadline?: string | null
          description?: string | null
          goal_type?: string
          id?: string
          priority?: string | null
          status?: string | null
          target_value?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      islamic_learning_paths: {
        Row: {
          age_appropriate: boolean | null
          assessment_methods: Json | null
          character_traits_focus: Json | null
          child_id: string
          created_at: string | null
          created_by_ai: boolean | null
          cultural_adaptations: Json | null
          curriculum_modules: Json
          difficulty_level: number | null
          estimated_duration_weeks: number | null
          family_involvement_level: string | null
          hadith_studies_focus: Json | null
          id: string
          learning_objectives: Json
          path_description: string | null
          path_name: string
          practical_applications: Json | null
          prerequisite_skills: Json | null
          progression_milestones: Json | null
          quranic_verses_focus: Json | null
          reviewed_by_scholar: string | null
          scholar_approval_status: string | null
          updated_at: string | null
        }
        Insert: {
          age_appropriate?: boolean | null
          assessment_methods?: Json | null
          character_traits_focus?: Json | null
          child_id: string
          created_at?: string | null
          created_by_ai?: boolean | null
          cultural_adaptations?: Json | null
          curriculum_modules: Json
          difficulty_level?: number | null
          estimated_duration_weeks?: number | null
          family_involvement_level?: string | null
          hadith_studies_focus?: Json | null
          id?: string
          learning_objectives: Json
          path_description?: string | null
          path_name: string
          practical_applications?: Json | null
          prerequisite_skills?: Json | null
          progression_milestones?: Json | null
          quranic_verses_focus?: Json | null
          reviewed_by_scholar?: string | null
          scholar_approval_status?: string | null
          updated_at?: string | null
        }
        Update: {
          age_appropriate?: boolean | null
          assessment_methods?: Json | null
          character_traits_focus?: Json | null
          child_id?: string
          created_at?: string | null
          created_by_ai?: boolean | null
          cultural_adaptations?: Json | null
          curriculum_modules?: Json
          difficulty_level?: number | null
          estimated_duration_weeks?: number | null
          family_involvement_level?: string | null
          hadith_studies_focus?: Json | null
          id?: string
          learning_objectives?: Json
          path_description?: string | null
          path_name?: string
          practical_applications?: Json | null
          prerequisite_skills?: Json | null
          progression_milestones?: Json | null
          quranic_verses_focus?: Json | null
          reviewed_by_scholar?: string | null
          scholar_approval_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      islamic_motivational_content: {
        Row: {
          age_group: string
          arabic_text: string | null
          authenticity_level: string | null
          content_type: string
          created_at: string
          emotional_tone: string | null
          english_translation: string
          id: string
          occasion: string | null
          source_reference: string
          theme: string
          transliteration: string | null
          updated_at: string
        }
        Insert: {
          age_group: string
          arabic_text?: string | null
          authenticity_level?: string | null
          content_type: string
          created_at?: string
          emotional_tone?: string | null
          english_translation: string
          id?: string
          occasion?: string | null
          source_reference: string
          theme: string
          transliteration?: string | null
          updated_at?: string
        }
        Update: {
          age_group?: string
          arabic_text?: string | null
          authenticity_level?: string | null
          content_type?: string
          created_at?: string
          emotional_tone?: string | null
          english_translation?: string
          id?: string
          occasion?: string | null
          source_reference?: string
          theme?: string
          transliteration?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      islamic_personality_types: {
        Row: {
          companion_type: string | null
          created_at: string | null
          description: string | null
          id: string
          learning_style: Json | null
          name: string
          preferred_activities: Json | null
        }
        Insert: {
          companion_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          learning_style?: Json | null
          name: string
          preferred_activities?: Json | null
        }
        Update: {
          companion_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          learning_style?: Json | null
          name?: string
          preferred_activities?: Json | null
        }
        Relationships: []
      }
      islamic_progress_reports: {
        Row: {
          character_development_insights: Json
          child_id: string
          created_at: string | null
          cultural_considerations: Json | null
          family_guidance_suggestions: Json | null
          generated_by_ai: boolean | null
          hadith_recommendations: Json | null
          id: string
          islamic_values_application: Json | null
          knowledge_acquisition_summary: Json
          next_period_goals: Json | null
          overall_progress_score: number | null
          parent_feedback: Json | null
          prayer_consistency_analysis: Json | null
          quran_memorization_progress: Json | null
          quranic_recommendations: Json | null
          recommended_improvements: Json | null
          report_period_end: string
          report_period_start: string
          reviewed_by_scholar: string | null
          scholar_insights: string | null
          spiritual_growth_assessment: Json
          updated_at: string | null
        }
        Insert: {
          character_development_insights: Json
          child_id: string
          created_at?: string | null
          cultural_considerations?: Json | null
          family_guidance_suggestions?: Json | null
          generated_by_ai?: boolean | null
          hadith_recommendations?: Json | null
          id?: string
          islamic_values_application?: Json | null
          knowledge_acquisition_summary: Json
          next_period_goals?: Json | null
          overall_progress_score?: number | null
          parent_feedback?: Json | null
          prayer_consistency_analysis?: Json | null
          quran_memorization_progress?: Json | null
          quranic_recommendations?: Json | null
          recommended_improvements?: Json | null
          report_period_end: string
          report_period_start: string
          reviewed_by_scholar?: string | null
          scholar_insights?: string | null
          spiritual_growth_assessment: Json
          updated_at?: string | null
        }
        Update: {
          character_development_insights?: Json
          child_id?: string
          created_at?: string | null
          cultural_considerations?: Json | null
          family_guidance_suggestions?: Json | null
          generated_by_ai?: boolean | null
          hadith_recommendations?: Json | null
          id?: string
          islamic_values_application?: Json | null
          knowledge_acquisition_summary?: Json
          next_period_goals?: Json | null
          overall_progress_score?: number | null
          parent_feedback?: Json | null
          prayer_consistency_analysis?: Json | null
          quran_memorization_progress?: Json | null
          quranic_recommendations?: Json | null
          recommended_improvements?: Json | null
          report_period_end?: string
          report_period_start?: string
          reviewed_by_scholar?: string | null
          scholar_insights?: string | null
          spiritual_growth_assessment?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      islamic_sibling_challenges: {
        Row: {
          challenge_type: string
          created_at: string | null
          created_by: string
          description: string | null
          end_date: string
          family_id: string
          id: string
          islamic_values: Json | null
          participants: Json | null
          rewards: Json | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
          winner_announcement: Json | null
        }
        Insert: {
          challenge_type: string
          created_at?: string | null
          created_by: string
          description?: string | null
          end_date: string
          family_id: string
          id?: string
          islamic_values?: Json | null
          participants?: Json | null
          rewards?: Json | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          winner_announcement?: Json | null
        }
        Update: {
          challenge_type?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          end_date?: string
          family_id?: string
          id?: string
          islamic_values?: Json | null
          participants?: Json | null
          rewards?: Json | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          winner_announcement?: Json | null
        }
        Relationships: []
      }
      islamic_special_days: {
        Row: {
          activities: Json | null
          age_recommendations: string | null
          created_at: string
          date_type: string
          date_value: string | null
          description: string
          educational_content: Json | null
          family_activities: Json | null
          id: string
          name_arabic: string | null
          name_english: string
          significance: string
        }
        Insert: {
          activities?: Json | null
          age_recommendations?: string | null
          created_at?: string
          date_type: string
          date_value?: string | null
          description: string
          educational_content?: Json | null
          family_activities?: Json | null
          id?: string
          name_arabic?: string | null
          name_english: string
          significance: string
        }
        Update: {
          activities?: Json | null
          age_recommendations?: string | null
          created_at?: string
          date_type?: string
          date_value?: string | null
          description?: string
          educational_content?: Json | null
          family_activities?: Json | null
          id?: string
          name_arabic?: string | null
          name_english?: string
          significance?: string
        }
        Relationships: []
      }
      islamic_story_prompts: {
        Row: {
          created_at: string
          created_by: string | null
          difficulty_level: string | null
          id: string
          islamic_concepts: Json | null
          islamic_source: string | null
          main_characters: Json | null
          moral_lessons: Json | null
          prompt_text: string
          status: string | null
          target_age_group: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          difficulty_level?: string | null
          id?: string
          islamic_concepts?: Json | null
          islamic_source?: string | null
          main_characters?: Json | null
          moral_lessons?: Json | null
          prompt_text: string
          status?: string | null
          target_age_group: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          difficulty_level?: string | null
          id?: string
          islamic_concepts?: Json | null
          islamic_source?: string | null
          main_characters?: Json | null
          moral_lessons?: Json | null
          prompt_text?: string
          status?: string | null
          target_age_group?: string
          title?: string
        }
        Relationships: []
      }
      islamic_surprise_rewards: {
        Row: {
          child_id: string
          child_reaction: string | null
          created_at: string
          delivered_at: string
          id: string
          islamic_significance: string | null
          reward_data: Json
          reward_type: string
          trigger_reason: string
        }
        Insert: {
          child_id: string
          child_reaction?: string | null
          created_at?: string
          delivered_at?: string
          id?: string
          islamic_significance?: string | null
          reward_data?: Json
          reward_type: string
          trigger_reason: string
        }
        Update: {
          child_id?: string
          child_reaction?: string | null
          created_at?: string
          delivered_at?: string
          id?: string
          islamic_significance?: string | null
          reward_data?: Json
          reward_type?: string
          trigger_reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "islamic_surprise_rewards_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_analytics_view"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "islamic_surprise_rewards_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      islamic_terminology: {
        Row: {
          arabic_term: string
          category: string
          created_at: string
          english_translation: string
          explanation: string
          id: string
          transliteration: string
          updated_at: string
        }
        Insert: {
          arabic_term: string
          category: string
          created_at?: string
          english_translation: string
          explanation: string
          id?: string
          transliteration: string
          updated_at?: string
        }
        Update: {
          arabic_term?: string
          category?: string
          created_at?: string
          english_translation?: string
          explanation?: string
          id?: string
          transliteration?: string
          updated_at?: string
        }
        Relationships: []
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
      prayer_calculation_methods: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          parameters: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          parameters?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          parameters?: Json | null
        }
        Relationships: []
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
      scholar_review_submissions: {
        Row: {
          age_appropriateness_score: number | null
          ai_generated_insights: Json | null
          approval_status: string | null
          assigned_scholar: string | null
          child_id: string
          cultural_adjustments: Json | null
          educational_value_score: number | null
          final_recommendations: Json | null
          id: string
          islamic_authenticity_score: number | null
          review_priority: string | null
          review_status: string | null
          reviewed_at: string | null
          revision_requests: Json | null
          scholar_review_notes: string | null
          submission_data: Json
          submission_id: string
          submission_type: string
          submitted_at: string | null
          submitted_by: string
          updated_at: string | null
        }
        Insert: {
          age_appropriateness_score?: number | null
          ai_generated_insights?: Json | null
          approval_status?: string | null
          assigned_scholar?: string | null
          child_id: string
          cultural_adjustments?: Json | null
          educational_value_score?: number | null
          final_recommendations?: Json | null
          id?: string
          islamic_authenticity_score?: number | null
          review_priority?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          revision_requests?: Json | null
          scholar_review_notes?: string | null
          submission_data: Json
          submission_id: string
          submission_type: string
          submitted_at?: string | null
          submitted_by: string
          updated_at?: string | null
        }
        Update: {
          age_appropriateness_score?: number | null
          ai_generated_insights?: Json | null
          approval_status?: string | null
          assigned_scholar?: string | null
          child_id?: string
          cultural_adjustments?: Json | null
          educational_value_score?: number | null
          final_recommendations?: Json | null
          id?: string
          islamic_authenticity_score?: number | null
          review_priority?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          revision_requests?: Json | null
          scholar_review_notes?: string | null
          submission_data?: Json
          submission_id?: string
          submission_type?: string
          submitted_at?: string | null
          submitted_by?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      stories: {
        Row: {
          age_group: string
          audio_url: string | null
          category: string | null
          characters: Json | null
          content: string
          created_at: string | null
          created_by: string | null
          difficulty_level: string | null
          id: string
          illustration_guidelines: string | null
          image_url: string | null
          islamic_lessons: Json | null
          islamic_source: string | null
          islamic_terminology: Json | null
          moral: string | null
          published_at: string | null
          reading_time: number | null
          scheduled_for: string | null
          scholar_notes: string | null
          status: string
          target_age_max: number | null
          target_age_min: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          age_group?: string
          audio_url?: string | null
          category?: string | null
          characters?: Json | null
          content: string
          created_at?: string | null
          created_by?: string | null
          difficulty_level?: string | null
          id?: string
          illustration_guidelines?: string | null
          image_url?: string | null
          islamic_lessons?: Json | null
          islamic_source?: string | null
          islamic_terminology?: Json | null
          moral?: string | null
          published_at?: string | null
          reading_time?: number | null
          scheduled_for?: string | null
          scholar_notes?: string | null
          status?: string
          target_age_max?: number | null
          target_age_min?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          age_group?: string
          audio_url?: string | null
          category?: string | null
          characters?: Json | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          difficulty_level?: string | null
          id?: string
          illustration_guidelines?: string | null
          image_url?: string | null
          islamic_lessons?: Json | null
          islamic_source?: string | null
          islamic_terminology?: Json | null
          moral?: string | null
          published_at?: string | null
          reading_time?: number | null
          scheduled_for?: string | null
          scholar_notes?: string | null
          status?: string
          target_age_max?: number | null
          target_age_min?: number | null
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
      story_generation_requests: {
        Row: {
          age_range: string
          child_id: string | null
          created_at: string
          family_id: string
          generated_story_id: string | null
          id: string
          islamic_focus: Json | null
          request_status: string | null
          requested_by: string
          specific_requests: string | null
          story_theme: string
          updated_at: string
        }
        Insert: {
          age_range: string
          child_id?: string | null
          created_at?: string
          family_id: string
          generated_story_id?: string | null
          id?: string
          islamic_focus?: Json | null
          request_status?: string | null
          requested_by: string
          specific_requests?: string | null
          story_theme: string
          updated_at?: string
        }
        Update: {
          age_range?: string
          child_id?: string | null
          created_at?: string
          family_id?: string
          generated_story_id?: string | null
          id?: string
          islamic_focus?: Json | null
          request_status?: string | null
          requested_by?: string
          specific_requests?: string | null
          story_theme?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_generation_requests_generated_story_id_fkey"
            columns: ["generated_story_id"]
            isOneToOne: false
            referencedRelation: "stories"
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
      story_reviews: {
        Row: {
          age_appropriateness_score: number | null
          created_at: string
          educational_value_score: number | null
          id: string
          islamic_authenticity_score: number | null
          review_notes: string | null
          review_status: string
          reviewer_id: string
          reviewer_type: string
          story_id: string
          updated_at: string
        }
        Insert: {
          age_appropriateness_score?: number | null
          created_at?: string
          educational_value_score?: number | null
          id?: string
          islamic_authenticity_score?: number | null
          review_notes?: string | null
          review_status?: string
          reviewer_id: string
          reviewer_type: string
          story_id: string
          updated_at?: string
        }
        Update: {
          age_appropriateness_score?: number | null
          created_at?: string
          educational_value_score?: number | null
          id?: string
          islamic_authenticity_score?: number | null
          review_notes?: string | null
          review_status?: string
          reviewer_id?: string
          reviewer_type?: string
          story_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_reviews_story_id_fkey"
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
      get_child_islamic_analytics: {
        Args: { child_uuid: string }
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
      get_story_review_summary: {
        Args: { story_uuid: string }
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
      is_story_approved_for_family: {
        Args: { story_uuid: string; family_uuid: string }
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
