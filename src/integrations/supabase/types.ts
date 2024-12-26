export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      attendance_records: {
        Row: {
          check_in_time: string | null
          created_at: string
          event_id: string | null
          id: string
          recorded_by: string | null
          registration_id: string | null
          status: string | null
        }
        Insert: {
          check_in_time?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          recorded_by?: string | null
          registration_id?: string | null
          status?: string | null
        }
        Update: {
          check_in_time?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          recorded_by?: string | null
          registration_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      banners: {
        Row: {
          active: boolean | null
          created_at: string
          desktop_image: string
          id: string
          mobile_image: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          desktop_image: string
          id?: string
          mobile_image: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          desktop_image?: string
          id?: string
          mobile_image?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_feedback: {
        Row: {
          content_rating: number | null
          created_at: string
          event_id: string | null
          feedback_text: string | null
          id: string
          name: string | null
          organization_rating: number | null
          overall_rating: number | null
          phone: string | null
          presenter_rating: number | null
        }
        Insert: {
          content_rating?: number | null
          created_at?: string
          event_id?: string | null
          feedback_text?: string | null
          id?: string
          name?: string | null
          organization_rating?: number | null
          overall_rating?: number | null
          phone?: string | null
          presenter_rating?: number | null
        }
        Update: {
          content_rating?: number | null
          created_at?: string
          event_id?: string | null
          feedback_text?: string | null
          id?: string
          name?: string | null
          organization_rating?: number | null
          overall_rating?: number | null
          phone?: string | null
          presenter_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "event_feedback_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_notification_settings: {
        Row: {
          created_at: string
          event_id: string | null
          feedback_enabled: boolean | null
          id: string
          registration_enabled: boolean | null
          reminder_enabled: boolean | null
          reminder_hours: number[] | null
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          feedback_enabled?: boolean | null
          id?: string
          registration_enabled?: boolean | null
          reminder_enabled?: boolean | null
          reminder_hours?: number[] | null
        }
        Update: {
          created_at?: string
          event_id?: string | null
          feedback_enabled?: boolean | null
          id?: string
          registration_enabled?: boolean | null
          reminder_enabled?: boolean | null
          reminder_hours?: number[] | null
        }
        Relationships: [
          {
            foreignKeyName: "event_notification_settings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_reports: {
        Row: {
          additional_links: string[] | null
          comments: string[] | null
          created_at: string
          event_id: string | null
          executor_id: string | null
          files: string[] | null
          id: string
          photos: string[] | null
          report_text: string
          satisfaction_level: number | null
          video_links: string[] | null
        }
        Insert: {
          additional_links?: string[] | null
          comments?: string[] | null
          created_at?: string
          event_id?: string | null
          executor_id?: string | null
          files?: string[] | null
          id?: string
          photos?: string[] | null
          report_text: string
          satisfaction_level?: number | null
          video_links?: string[] | null
        }
        Update: {
          additional_links?: string[] | null
          comments?: string[] | null
          created_at?: string
          event_id?: string | null
          executor_id?: string | null
          files?: string[] | null
          id?: string
          photos?: string[] | null
          report_text?: string
          satisfaction_level?: number | null
          video_links?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "event_reports_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          beneficiary_type: string
          certificate_type: string | null
          created_at: string
          date: string
          description: string | null
          event_hours: number | null
          event_type: string
          id: string
          image_url: string
          location: string
          max_attendees: number
          price: number | null
          registration_end_date: string | null
          registration_start_date: string | null
          time: string
          title: string
        }
        Insert: {
          beneficiary_type?: string
          certificate_type?: string | null
          created_at?: string
          date: string
          description?: string | null
          event_hours?: number | null
          event_type: string
          id?: string
          image_url: string
          location: string
          max_attendees?: number
          price?: number | null
          registration_end_date?: string | null
          registration_start_date?: string | null
          time: string
          title: string
        }
        Update: {
          beneficiary_type?: string
          certificate_type?: string | null
          created_at?: string
          date?: string
          description?: string | null
          event_hours?: number | null
          event_type?: string
          id?: string
          image_url?: string
          location?: string
          max_attendees?: number
          price?: number | null
          registration_end_date?: string | null
          registration_start_date?: string | null
          time?: string
          title?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          event_id: string | null
          id: string
          notification_type: string
          registration_id: string | null
          sent_at: string
          status: string | null
          template_id: string | null
        }
        Insert: {
          event_id?: string | null
          id?: string
          notification_type: string
          registration_id?: string | null
          sent_at?: string
          status?: string | null
          template_id?: string | null
        }
        Update: {
          event_id?: string | null
          id?: string
          notification_type?: string
          registration_id?: string | null
          sent_at?: string
          status?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          created_at: string
          email: string
          event_id: string | null
          id: string
          name: string
          phone: string
          registration_number: string
        }
        Insert: {
          created_at?: string
          email: string
          event_id?: string | null
          id?: string
          name: string
          phone: string
          registration_number: string
        }
        Update: {
          created_at?: string
          email?: string
          event_id?: string | null
          id?: string
          name?: string
          phone?: string
          registration_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          role_id: string
          user_id: string
        }
        Insert: {
          role_id: string
          user_id: string
        }
        Update: {
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_settings: {
        Row: {
          account_id: string | null
          api_key: string
          business_phone: string
          callback_url: string | null
          created_at: string
          id: string
          updated_at: string
          whatsapp_number_id: string | null
        }
        Insert: {
          account_id?: string | null
          api_key: string
          business_phone: string
          callback_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          whatsapp_number_id?: string | null
        }
        Update: {
          account_id?: string | null
          api_key?: string
          business_phone?: string
          callback_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          whatsapp_number_id?: string | null
        }
        Relationships: []
      }
      whatsapp_templates: {
        Row: {
          content: string
          created_at: string
          id: string
          is_default: boolean | null
          language: string | null
          name: string
          status: string | null
          template_type: string | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          language?: string | null
          name: string
          status?: string | null
          template_type?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          language?: string | null
          name?: string
          status?: string | null
          template_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_user_management: {
        Args: {
          operation: string
          target_user_id: string
          new_password?: string
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
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
