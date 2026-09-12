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
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          metadata: Json
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          target_id?: string | null
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          client_id: string
          created_at: string
          duration: number
          end_time: string
          id: string
          note: string | null
          repeat: Database["public"]["Enums"]["booking_repeat"]
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
          trainer_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          duration: number
          end_time: string
          id?: string
          note?: string | null
          repeat?: Database["public"]["Enums"]["booking_repeat"]
          start_time: string
          status?: Database["public"]["Enums"]["booking_status"]
          trainer_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          duration?: number
          end_time?: string
          id?: string
          note?: string | null
          repeat?: Database["public"]["Enums"]["booking_repeat"]
          start_time?: string
          status?: Database["public"]["Enums"]["booking_status"]
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_blocks: {
        Row: {
          created_at: string
          end_time: string
          id: string
          note: string | null
          start_time: string
          title: string
          trainer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          note?: string | null
          start_time: string
          title: string
          trainer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          note?: string | null
          start_time?: string
          title?: string
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_blocks_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calibrator_events: {
        Row: {
          client_id: string
          created_at: string
          decided_at: string | null
          fired_signals: string[]
          headline: string
          id: string
          input_snapshot: Json
          reasoning: string
          suggestion_kind: string
          suggestion_rule: string
          trainer_decision: string | null
          trainer_id: string | null
          trainer_note: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          decided_at?: string | null
          fired_signals?: string[]
          headline: string
          id?: string
          input_snapshot: Json
          reasoning: string
          suggestion_kind: string
          suggestion_rule: string
          trainer_decision?: string | null
          trainer_id?: string | null
          trainer_note?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          decided_at?: string | null
          fired_signals?: string[]
          headline?: string
          id?: string
          input_snapshot?: Json
          reasoning?: string
          suggestion_kind?: string
          suggestion_rule?: string
          trainer_decision?: string | null
          trainer_id?: string | null
          trainer_note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calibrator_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calibrator_events_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_members: {
        Row: {
          joined_at: string
          thread_id: string
          user_id: string
        }
        Insert: {
          joined_at?: string
          thread_id: string
          user_id: string
        }
        Update: {
          joined_at?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_members_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          sender_id: string
          thread_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          sender_id: string
          thread_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          sender_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_thread_reads: {
        Row: {
          last_read_at: string
          thread_id: string
          user_id: string
        }
        Insert: {
          last_read_at?: string
          thread_id: string
          user_id: string
        }
        Update: {
          last_read_at?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_thread_reads_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_thread_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          last_message_at: string | null
          title: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          last_message_at?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          last_message_at?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_threads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_test_categories: {
        Row: {
          category: Database["public"]["Enums"]["test_category"]
          client_id: string
          created_at: string
          enabled_by: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["test_category"]
          client_id: string
          created_at?: string
          enabled_by?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["test_category"]
          client_id?: string
          created_at?: string
          enabled_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_test_categories_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_test_categories_enabled_by_fkey"
            columns: ["enabled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_trainer_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          client_id: string
          created_at: string
          ended_at: string | null
          id: string
          reason: string | null
          status: Database["public"]["Enums"]["assignment_status"]
          trainer_id: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          client_id: string
          created_at?: string
          ended_at?: string | null
          id?: string
          reason?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          trainer_id: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          client_id?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          reason?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_trainer_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_trainer_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_trainer_assignments_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_checkins: {
        Row: {
          afraid_to_train: boolean
          checkin_date: string
          client_id: string
          completed_planned_activity: string | null
          created_at: string
          energy: string | null
          id: string
          new_symptom: boolean
          new_symptom_note: string | null
          pain_now: number | null
          sleep: string | null
        }
        Insert: {
          afraid_to_train?: boolean
          checkin_date?: string
          client_id: string
          completed_planned_activity?: string | null
          created_at?: string
          energy?: string | null
          id?: string
          new_symptom?: boolean
          new_symptom_note?: string | null
          pain_now?: number | null
          sleep?: string | null
        }
        Update: {
          afraid_to_train?: boolean
          checkin_date?: string
          client_id?: string
          completed_planned_activity?: string | null
          created_at?: string
          energy?: string | null
          id?: string
          new_symptom?: boolean
          new_symptom_note?: string | null
          pain_now?: number | null
          sleep?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_checkins_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          body_areas: string[]
          created_at: string
          created_by: string | null
          default_duration_sec: number | null
          default_reps: number | null
          default_sets: number | null
          id: string
          instruction: string | null
          media_url: string | null
          name: string
          progression_of: string | null
          purposes: string[]
          regression_of: string | null
          relevant_stages: Database["public"]["Enums"]["trapp_stage"][]
          updated_at: string
        }
        Insert: {
          body_areas?: string[]
          created_at?: string
          created_by?: string | null
          default_duration_sec?: number | null
          default_reps?: number | null
          default_sets?: number | null
          id?: string
          instruction?: string | null
          media_url?: string | null
          name: string
          progression_of?: string | null
          purposes?: string[]
          regression_of?: string | null
          relevant_stages?: Database["public"]["Enums"]["trapp_stage"][]
          updated_at?: string
        }
        Update: {
          body_areas?: string[]
          created_at?: string
          created_by?: string | null
          default_duration_sec?: number | null
          default_reps?: number | null
          default_sets?: number | null
          id?: string
          instruction?: string | null
          media_url?: string | null
          name?: string
          progression_of?: string | null
          purposes?: string[]
          regression_of?: string | null
          relevant_stages?: Database["public"]["Enums"]["trapp_stage"][]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_progression_of_fkey"
            columns: ["progression_of"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_regression_of_fkey"
            columns: ["regression_of"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_days: {
        Row: {
          calories_kcal: number
          carbs_g: number
          created_at: string
          day_date: string
          fat_g: number
          id: string
          protein_g: number
          updated_at: string
          user_id: string
        }
        Insert: {
          calories_kcal?: number
          carbs_g?: number
          created_at?: string
          day_date?: string
          fat_g?: number
          id?: string
          protein_g?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          calories_kcal?: number
          carbs_g?: number
          created_at?: string
          day_date?: string
          fat_g?: number
          id?: string
          protein_g?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_days_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_meals: {
        Row: {
          assumption: string | null
          calories_kcal: number
          carbs_g: number
          confidence: number | null
          created_at: string
          day_id: string
          fat_g: number
          id: string
          meal_time: string | null
          protein_g: number
          raw_text: string | null
          source: string
          user_id: string
        }
        Insert: {
          assumption?: string | null
          calories_kcal?: number
          carbs_g?: number
          confidence?: number | null
          created_at?: string
          day_id: string
          fat_g?: number
          id?: string
          meal_time?: string | null
          protein_g?: number
          raw_text?: string | null
          source?: string
          user_id: string
        }
        Update: {
          assumption?: string | null
          calories_kcal?: number
          carbs_g?: number
          confidence?: number | null
          created_at?: string
          day_id?: string
          fat_g?: number
          id?: string
          meal_time?: string | null
          protein_g?: number
          raw_text?: string | null
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_meals_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "nutrition_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_meals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_profiles: {
        Row: {
          age_years: number | null
          goal: string | null
          height_cm: number | null
          job_activity: string | null
          sex: string | null
          training_activity: string | null
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          age_years?: number | null
          goal?: string | null
          height_cm?: number | null
          job_activity?: string | null
          sex?: string | null
          training_activity?: string | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          age_years?: number | null
          goal?: string | null
          height_cm?: number | null
          job_activity?: string | null
          sex?: string | null
          training_activity?: string | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_assessments: {
        Row: {
          activity_level: string | null
          aggravating_factors: string | null
          calibration_profile: Database["public"]["Enums"]["calibration_profile"]
          client_id: string
          completed_at: string | null
          created_at: string
          fear_of_movement_score: number | null
          goal: string | null
          id: string
          limiting_factors: string | null
          pain_intensity_now: number | null
          previous_injuries: string | null
          previous_treatment: string | null
          problem_area: string | null
          problem_duration: string | null
          red_flag_cleared: boolean
          red_flags: Json
          relieving_factors: string | null
          sleep_quality: string | null
          stress_level: string | null
          updated_at: string
        }
        Insert: {
          activity_level?: string | null
          aggravating_factors?: string | null
          calibration_profile?: Database["public"]["Enums"]["calibration_profile"]
          client_id: string
          completed_at?: string | null
          created_at?: string
          fear_of_movement_score?: number | null
          goal?: string | null
          id?: string
          limiting_factors?: string | null
          pain_intensity_now?: number | null
          previous_injuries?: string | null
          previous_treatment?: string | null
          problem_area?: string | null
          problem_duration?: string | null
          red_flag_cleared?: boolean
          red_flags?: Json
          relieving_factors?: string | null
          sleep_quality?: string | null
          stress_level?: string | null
          updated_at?: string
        }
        Update: {
          activity_level?: string | null
          aggravating_factors?: string | null
          calibration_profile?: Database["public"]["Enums"]["calibration_profile"]
          client_id?: string
          completed_at?: string | null
          created_at?: string
          fear_of_movement_score?: number | null
          goal?: string | null
          id?: string
          limiting_factors?: string | null
          pain_intensity_now?: number | null
          previous_injuries?: string | null
          previous_treatment?: string | null
          problem_area?: string | null
          problem_duration?: string | null
          red_flag_cleared?: boolean
          red_flags?: Json
          relieving_factors?: string | null
          sleep_quality?: string | null
          stress_level?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_assessments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_history: {
        Row: {
          assessment_id: string
          changed_at: string
          changed_fields: string[]
          client_id: string
          id: string
          snapshot: Json
        }
        Insert: {
          assessment_id: string
          changed_at?: string
          changed_fields?: string[]
          client_id: string
          id?: string
          snapshot: Json
        }
        Update: {
          assessment_id?: string
          changed_at?: string
          changed_fields?: string[]
          client_id?: string
          id?: string
          snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_history_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "onboarding_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_history_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_ore: number | null
          client_id: string
          created_at: string
          currency: string
          id: string
          product_type: Database["public"]["Enums"]["order_product_type"]
          related_booking_id: string | null
          related_program_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string
        }
        Insert: {
          amount_ore?: number | null
          client_id: string
          created_at?: string
          currency?: string
          id?: string
          product_type: Database["public"]["Enums"]["order_product_type"]
          related_booking_id?: string | null
          related_program_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_ore?: number | null
          client_id?: string
          created_at?: string
          currency?: string
          id?: string
          product_type?: Database["public"]["Enums"]["order_product_type"]
          related_booking_id?: string | null
          related_program_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_related_booking_id_fkey"
            columns: ["related_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_related_program_id_fkey"
            columns: ["related_program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      pain_entries: {
        Row: {
          area_key: string
          area_label: string
          client_id: string
          created_at: string
          created_by: string | null
          entry_date: string
          function_note: string | null
          id: string
          intensity: number
          is_active: boolean
          note: string | null
          pattern: Database["public"]["Enums"]["pain_pattern"][]
          provokes: string[]
          quality: Database["public"]["Enums"]["pain_quality"][]
          relieves: string[]
        }
        Insert: {
          area_key: string
          area_label: string
          client_id: string
          created_at?: string
          created_by?: string | null
          entry_date?: string
          function_note?: string | null
          id?: string
          intensity: number
          is_active?: boolean
          note?: string | null
          pattern?: Database["public"]["Enums"]["pain_pattern"][]
          provokes?: string[]
          quality?: Database["public"]["Enums"]["pain_quality"][]
          relieves?: string[]
        }
        Update: {
          area_key?: string
          area_label?: string
          client_id?: string
          created_at?: string
          created_by?: string | null
          entry_date?: string
          function_note?: string | null
          id?: string
          intensity?: number
          is_active?: boolean
          note?: string | null
          pattern?: Database["public"]["Enums"]["pain_pattern"][]
          provokes?: string[]
          quality?: Database["public"]["Enums"]["pain_quality"][]
          relieves?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "pain_entries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pain_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          birth_date: string | null
          city: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          postal_code: string | null
          role: Database["public"]["Enums"]["app_role"]
          signup_intent: string
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          postal_code?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          signup_intent?: string
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          postal_code?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          signup_intent?: string
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      program_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          client_id: string
          current_day_index: number
          id: string
          program_id: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          client_id: string
          current_day_index?: number
          id?: string
          program_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          client_id?: string
          current_day_index?: number
          id?: string
          program_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_assignments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      program_day_exercises: {
        Row: {
          duration_sec: number | null
          exercise_id: string
          id: string
          load_note: string | null
          program_day_id: string
          reps: number | null
          sets: number | null
          sort_order: number
        }
        Insert: {
          duration_sec?: number | null
          exercise_id: string
          id?: string
          load_note?: string | null
          program_day_id: string
          reps?: number | null
          sets?: number | null
          sort_order?: number
        }
        Update: {
          duration_sec?: number | null
          exercise_id?: string
          id?: string
          load_note?: string | null
          program_day_id?: string
          reps?: number | null
          sets?: number | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "program_day_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_day_exercises_program_day_id_fkey"
            columns: ["program_day_id"]
            isOneToOne: false
            referencedRelation: "program_days"
            referencedColumns: ["id"]
          },
        ]
      }
      program_days: {
        Row: {
          day_index: number
          id: string
          program_id: string
          title: string | null
        }
        Insert: {
          day_index: number
          id?: string
          program_id: string
          title?: string | null
        }
        Update: {
          day_index?: number
          id?: string
          program_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "program_days_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          body_area: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_template: boolean
          name: string
          relevant_stage: Database["public"]["Enums"]["trapp_stage"] | null
          updated_at: string
        }
        Insert: {
          body_area?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_template?: boolean
          name: string
          relevant_stage?: Database["public"]["Enums"]["trapp_stage"] | null
          updated_at?: string
        }
        Update: {
          body_area?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_template?: boolean
          name?: string
          relevant_stage?: Database["public"]["Enums"]["trapp_stage"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          client_id: string
          created_at: string
          current_period_end: string | null
          id: string
          plan_key: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string
          stripe_price_id: string
          stripe_subscription_id: string
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          client_id: string
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan_key: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string
          stripe_price_id: string
          stripe_subscription_id: string
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          client_id?: string
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan_key?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string
          stripe_price_id?: string
          stripe_subscription_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      test_entries: {
        Row: {
          id: string
          metric_key: string
          session_id: string
          sort: number
          unit: string
          value: number
        }
        Insert: {
          id?: string
          metric_key: string
          session_id: string
          sort?: number
          unit: string
          value: number
        }
        Update: {
          id?: string
          metric_key?: string
          session_id?: string
          sort?: number
          unit?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "test_entries_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "test_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      test_sessions: {
        Row: {
          category: Database["public"]["Enums"]["test_category"]
          client_id: string
          created_at: string
          created_by: string | null
          id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["test_category"]
          client_id: string
          created_at?: string
          created_by?: string | null
          id?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["test_category"]
          client_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_sessions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_sessions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_applications: {
        Row: {
          applicant_id: string
          bio: string | null
          certifications: string | null
          created_at: string
          education: string | null
          id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["trainer_application_status"]
          submitted_at: string
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          applicant_id: string
          bio?: string | null
          certifications?: string | null
          created_at?: string
          education?: string | null
          id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["trainer_application_status"]
          submitted_at?: string
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          applicant_id?: string
          bio?: string | null
          certifications?: string | null
          created_at?: string
          education?: string | null
          id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["trainer_application_status"]
          submitted_at?: string
          updated_at?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trainer_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_profiles: {
        Row: {
          bio: string | null
          certifications: string | null
          created_at: string
          max_clients: number | null
          specialties: string[]
          status: Database["public"]["Enums"]["trainer_status"]
          trainer_id: string
          updated_at: string
        }
        Insert: {
          bio?: string | null
          certifications?: string | null
          created_at?: string
          max_clients?: number | null
          specialties?: string[]
          status?: Database["public"]["Enums"]["trainer_status"]
          trainer_id: string
          updated_at?: string
        }
        Update: {
          bio?: string | null
          certifications?: string | null
          created_at?: string
          max_clients?: number | null
          specialties?: string[]
          status?: Database["public"]["Enums"]["trainer_status"]
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_profiles_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_weekly_availability: {
        Row: {
          availability: Json
          trainer_id: string
          updated_at: string
        }
        Insert: {
          availability?: Json
          trainer_id: string
          updated_at?: string
        }
        Update: {
          availability?: Json
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_weekly_availability_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trapp_stage_history: {
        Row: {
          client_id: string
          created_at: string
          from_stage: Database["public"]["Enums"]["trapp_stage"] | null
          id: string
          reason: string
          to_stage: Database["public"]["Enums"]["trapp_stage"]
          triggered_by: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          from_stage?: Database["public"]["Enums"]["trapp_stage"] | null
          id?: string
          reason: string
          to_stage: Database["public"]["Enums"]["trapp_stage"]
          triggered_by?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          from_stage?: Database["public"]["Enums"]["trapp_stage"] | null
          id?: string
          reason?: string
          to_stage?: Database["public"]["Enums"]["trapp_stage"]
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trapp_stage_history_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trapp_stage_history_triggered_by_fkey"
            columns: ["triggered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trapp_state: {
        Row: {
          client_id: string
          current_stage: Database["public"]["Enums"]["trapp_stage"]
          entered_stage_at: string
          is_maintenance_mode: boolean
          updated_at: string
        }
        Insert: {
          client_id: string
          current_stage?: Database["public"]["Enums"]["trapp_stage"]
          entered_stage_at?: string
          is_maintenance_mode?: boolean
          updated_at?: string
        }
        Update: {
          client_id?: string
          current_stage?: Database["public"]["Enums"]["trapp_stage"]
          entered_stage_at?: string
          is_maintenance_mode?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trapp_state_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_completions: {
        Row: {
          assignment_id: string
          client_id: string
          completion_date: string
          created_at: string
          day_index: number
          id: string
          notes: string | null
          pain_during: number | null
          rpe: number | null
          status: Database["public"]["Enums"]["completion_status"]
        }
        Insert: {
          assignment_id: string
          client_id: string
          completion_date?: string
          created_at?: string
          day_index: number
          id?: string
          notes?: string | null
          pain_during?: number | null
          rpe?: number | null
          status: Database["public"]["Enums"]["completion_status"]
        }
        Update: {
          assignment_id?: string
          client_id?: string
          completion_date?: string
          created_at?: string
          day_index?: number
          id?: string
          notes?: string | null
          pain_during?: number | null
          rpe?: number | null
          status?: Database["public"]["Enums"]["completion_status"]
        }
        Relationships: [
          {
            foreignKeyName: "workout_completions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "program_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_completions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      zone_history: {
        Row: {
          client_id: string
          computed_reason: string
          created_at: string
          id: string
          inputs_snapshot: Json
          overridden_by: string | null
          trainer_overridden: boolean
          trainer_override_note: string | null
          zone: Database["public"]["Enums"]["zone"]
          zone_date: string
        }
        Insert: {
          client_id: string
          computed_reason: string
          created_at?: string
          id?: string
          inputs_snapshot: Json
          overridden_by?: string | null
          trainer_overridden?: boolean
          trainer_override_note?: string | null
          zone: Database["public"]["Enums"]["zone"]
          zone_date?: string
        }
        Update: {
          client_id?: string
          computed_reason?: string
          created_at?: string
          id?: string
          inputs_snapshot?: Json
          overridden_by?: string | null
          trainer_overridden?: boolean
          trainer_override_note?: string | null
          zone?: Database["public"]["Enums"]["zone"]
          zone_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "zone_history_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zone_history_overridden_by_fkey"
            columns: ["overridden_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_set_user_role: {
        Args: { p_new_role: string; p_user_id: string }
        Returns: undefined
      }
      advance_program_day: {
        Args: { p_assignment_id: string }
        Returns: number
      }
      assign_trainer: {
        Args: { p_client_id: string; p_reason?: string; p_trainer_id: string }
        Returns: string
      }
      chat_ensure_direct_thread: { Args: { p_other: string }; Returns: string }
      chat_search_users: {
        Args: { p_query: string }
        Returns: {
          avatar_url: string
          first_name: string
          id: string
          last_name: string
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      current_app_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      end_assignment: {
        Args: { p_client_id: string; p_reason?: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_assigned_trainer_of: {
        Args: { target_client_id: string }
        Returns: boolean
      }
      is_assigned_trainer_of_by_client: {
        Args: { p_client_id: string; p_trainer_id: string }
        Returns: boolean
      }
      is_chat_thread_member: { Args: { p_thread_id: string }; Returns: boolean }
      log_admin_action: {
        Args: {
          p_action: string
          p_metadata?: Json
          p_target_id: string
          p_target_type: string
        }
        Returns: undefined
      }
      record_order_from_webhook: {
        Args: {
          p_amount_ore: number
          p_client_id: string
          p_product_type: Database["public"]["Enums"]["order_product_type"]
          p_status: Database["public"]["Enums"]["order_status"]
          p_stripe_checkout_session_id: string
          p_stripe_payment_intent_id: string
        }
        Returns: string
      }
      review_trainer_application: {
        Args: { p_application_id: string; p_approve: boolean; p_notes?: string }
        Returns: undefined
      }
      set_calibration_profile: {
        Args: {
          p_client_id: string
          p_profile: Database["public"]["Enums"]["calibration_profile"]
        }
        Returns: undefined
      }
      set_trainer_status: {
        Args: {
          p_status: Database["public"]["Enums"]["trainer_status"]
          p_trainer_id: string
        }
        Returns: undefined
      }
      transition_trapp_stage: {
        Args: {
          p_client_id: string
          p_maintenance_mode?: boolean
          p_reason: string
          p_to_stage: Database["public"]["Enums"]["trapp_stage"]
        }
        Returns: undefined
      }
      upsert_subscription_from_webhook: {
        Args: {
          p_cancel_at_period_end: boolean
          p_client_id: string
          p_current_period_end: string
          p_plan_key: string
          p_status: Database["public"]["Enums"]["subscription_status"]
          p_stripe_customer_id: string
          p_stripe_price_id: string
          p_stripe_subscription_id: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "client" | "trainer" | "admin"
      assignment_status: "active" | "ended"
      booking_repeat: "none" | "weekly" | "biweekly"
      booking_status: "planned" | "confirmed" | "completed" | "cancelled"
      calibration_profile: "forsiktig" | "standard" | "aktiv"
      completion_status: "ja" | "delvis" | "nei"
      order_product_type: "program_access" | "membership" | "trainer_session"
      order_status: "pending" | "paid" | "failed" | "refunded"
      pain_pattern:
        | "konstant"
        | "episodisk"
        | "ved_belastning"
        | "morgenverst"
        | "etter_trening"
      pain_quality:
        | "murrende"
        | "stikkende"
        | "brennende"
        | "strålende"
        | "verkende"
        | "strammende"
      subscription_status:
        | "active"
        | "trialing"
        | "past_due"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "unpaid"
        | "paused"
      test_category: "bodyweight" | "strength" | "cardio"
      trainer_application_status: "pending" | "approved" | "rejected"
      trainer_status: "active" | "inactive"
      trapp_stage: "ro" | "kontroll" | "styrke" | "robusthet" | "frihet"
      zone: "green" | "yellow" | "red"
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
  public: {
    Enums: {
      app_role: ["client", "trainer", "admin"],
      assignment_status: ["active", "ended"],
      booking_repeat: ["none", "weekly", "biweekly"],
      booking_status: ["planned", "confirmed", "completed", "cancelled"],
      calibration_profile: ["forsiktig", "standard", "aktiv"],
      completion_status: ["ja", "delvis", "nei"],
      order_product_type: ["program_access", "membership", "trainer_session"],
      order_status: ["pending", "paid", "failed", "refunded"],
      pain_pattern: [
        "konstant",
        "episodisk",
        "ved_belastning",
        "morgenverst",
        "etter_trening",
      ],
      pain_quality: [
        "murrende",
        "stikkende",
        "brennende",
        "strålende",
        "verkende",
        "strammende",
      ],
      subscription_status: [
        "active",
        "trialing",
        "past_due",
        "canceled",
        "incomplete",
        "incomplete_expired",
        "unpaid",
        "paused",
      ],
      test_category: ["bodyweight", "strength", "cardio"],
      trainer_application_status: ["pending", "approved", "rejected"],
      trainer_status: ["active", "inactive"],
      trapp_stage: ["ro", "kontroll", "styrke", "robusthet", "frihet"],
      zone: ["green", "yellow", "red"],
    },
  },
} as const
