export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      classes: {
        Row: {
          content: Json | null
          created_at: string
          description: Json | null
          duration_minutes: number | null
          has_content: boolean | null
          id: string
          order_index: number | null
          resource_url: string | null
          subject_id: string
          title: Json
          video_url: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string
          description?: Json | null
          duration_minutes?: number | null
          has_content?: boolean | null
          id?: string
          order_index?: number | null
          resource_url?: string | null
          subject_id: string
          title: Json
          video_url?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string
          description?: Json | null
          duration_minutes?: number | null
          has_content?: boolean | null
          id?: string
          order_index?: number | null
          resource_url?: string | null
          subject_id?: string
          title?: Json
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      course_instructors: {
        Row: {
          assigned_at: string
          course_id: string
          id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          course_id: string
          id?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          course_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_instructors_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_instructors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          description: Json | null
          final_exam_passing_score: number | null
          final_exam_question_count: number | null
          final_exam_time_limit_minutes: number | null
          id: string
          status: string
          thumbnail_url: string | null
          title: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: Json | null
          final_exam_passing_score?: number | null
          final_exam_question_count?: number | null
          final_exam_time_limit_minutes?: number | null
          id?: string
          status?: string
          thumbnail_url?: string | null
          title: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: Json | null
          final_exam_passing_score?: number | null
          final_exam_question_count?: number | null
          final_exam_time_limit_minutes?: number | null
          id?: string
          status?: string
          thumbnail_url?: string | null
          title?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          certificate_code: string | null
          completed_at: string | null
          course_id: string
          enrolled_at: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          certificate_code?: string | null
          completed_at?: string | null
          course_id: string
          enrolled_at?: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          certificate_code?: string | null
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_attempts: {
        Row: {
          exam_id: string
          finished_at: string | null
          id: string
          passed: boolean | null
          score: number | null
          started_at: string
          user_id: string
        }
        Insert: {
          exam_id: string
          finished_at?: string | null
          id?: string
          passed?: boolean | null
          score?: number | null
          started_at?: string
          user_id: string
        }
        Update: {
          exam_id?: string
          finished_at?: string | null
          id?: string
          passed?: boolean | null
          score?: number | null
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          course_id: string
          created_at: string
          description: Json | null
          id: string
          max_attempts: number
          order_index: number | null
          passing_score: number
          subject_id: string
          time_limit_minutes: number | null
          title: Json
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: Json | null
          id?: string
          max_attempts?: number
          order_index?: number | null
          passing_score?: number
          subject_id: string
          time_limit_minutes?: number | null
          title: Json
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: Json | null
          id?: string
          max_attempts?: number
          order_index?: number | null
          passing_score?: number
          subject_id?: string
          time_limit_minutes?: number | null
          title?: Json
        }
        Relationships: [
          {
            foreignKeyName: "exams_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      final_exam_sessions: {
        Row: {
          course_id: string
          finished_at: string | null
          id: string
          passed: boolean | null
          question_ids: string[]
          score: number | null
          started_at: string
          user_id: string
        }
        Insert: {
          course_id: string
          finished_at?: string | null
          id?: string
          passed?: boolean | null
          question_ids: string[]
          score?: number | null
          started_at?: string
          user_id: string
        }
        Update: {
          course_id?: string
          finished_at?: string | null
          id?: string
          passed?: boolean | null
          question_ids?: string[]
          score?: number | null
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "final_exam_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "final_exam_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          class_id: string
          completed_at: string | null
          id: string
          is_completed: boolean
          user_id: string
        }
        Insert: {
          class_id: string
          completed_at?: string | null
          id?: string
          is_completed?: boolean
          user_id: string
        }
        Update: {
          class_id?: string
          completed_at?: string | null
          id?: string
          is_completed?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_subscribers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      options: {
        Row: {
          content: Json
          id: string
          is_correct: boolean
          question_id: string
        }
        Insert: {
          content: Json
          id?: string
          is_correct?: boolean
          question_id: string
        }
        Update: {
          content?: Json
          id?: string
          is_correct?: boolean
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          country_code: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          newsletter_opt_in: boolean
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          country_code?: string | null
          created_at?: string
          email: string
          first_name: string
          id: string
          is_active?: boolean
          last_name: string
          newsletter_opt_in?: boolean
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          country_code?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          newsletter_opt_in?: boolean
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          content: Json
          exam_id: string
          id: string
          order_index: number | null
          points: number
        }
        Insert: {
          content: Json
          exam_id: string
          id?: string
          order_index?: number | null
          points?: number
        }
        Update: {
          content?: Json
          exam_id?: string
          id?: string
          order_index?: number | null
          points?: number
        }
        Relationships: [
          {
            foreignKeyName: "questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      roles_users: {
        Row: {
          assigned_at: string
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roles_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          course_id: string
          created_at: string
          description: Json | null
          id: string
          order_index: number | null
          title: Json
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: Json | null
          id?: string
          order_index?: number | null
          title: Json
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: Json | null
          id?: string
          order_index?: number | null
          title?: Json
        }
        Relationships: [
          {
            foreignKeyName: "subjects_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      options_public: {
        Row: {
          content: Json | null
          id: string | null
          question_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_set_user_role: {
        Args: { p_role_id: string; p_user_id: string }
        Returns: undefined
      }
      complete_course: {
        Args: { p_course_id: string }
        Returns: {
          certificate_code: string | null
          completed_at: string | null
          course_id: string
          enrolled_at: string
          id: string
          status: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "enrollments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      course_subject_exam_chain_status: {
        Args: { p_course_id: string; p_exam_id: string; p_subject_id: string }
        Returns: {
          exam_ok: boolean
          subject_ok: boolean
        }[]
      }
      exam_module_unlocked: {
        Args: { p_exam_id: string; p_user_id: string }
        Returns: boolean
      }
      exam_window_expired: {
        Args: { p_limit_minutes: number; p_started_at: string }
        Returns: boolean
      }
      has_role: {
        Args: { p_role_slug: string; p_user_id: string }
        Returns: boolean
      }
      is_course_instructor: {
        Args: { p_course_id: string; p_user_id: string }
        Returns: boolean
      }
      new_certificate_code: { Args: never; Returns: string }
      start_exam_attempt: {
        Args: { p_exam_id: string }
        Returns: {
          exam_id: string
          finished_at: string | null
          id: string
          passed: boolean | null
          score: number | null
          started_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "exam_attempts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      start_final_exam: {
        Args: { p_course_id: string }
        Returns: {
          course_id: string
          finished_at: string | null
          id: string
          passed: boolean | null
          question_ids: string[]
          score: number | null
          started_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "final_exam_sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      submit_exam_attempt: {
        Args: { p_answers: Json; p_exam_id: string }
        Returns: {
          exam_id: string
          finished_at: string | null
          id: string
          passed: boolean | null
          score: number | null
          started_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "exam_attempts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      submit_final_exam: {
        Args: { p_answers: Json; p_course_id: string }
        Returns: {
          passed: boolean
          score: number
        }[]
      }
      subscribe_to_newsletter: { Args: { p_email: string }; Returns: boolean }
      unsubscribe_from_newsletter: {
        Args: { p_email: string }
        Returns: boolean
      }
      verify_certificate: {
        Args: { p_code: string }
        Returns: {
          completed_at: string
          course_title: Json
          full_name: string
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

