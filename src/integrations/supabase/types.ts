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
      activity_feedback: {
        Row: {
          activity_id: string | null
          content_rating: number | null
          created_at: string
          feedback_text: string | null
          id: string
          name: string | null
          organization_rating: number | null
          overall_rating: number | null
          phone: string | null
          presenter_rating: number | null
          project_activity_id: string | null
        }
        Insert: {
          activity_id?: string | null
          content_rating?: number | null
          created_at?: string
          feedback_text?: string | null
          id?: string
          name?: string | null
          organization_rating?: number | null
          overall_rating?: number | null
          phone?: string | null
          presenter_rating?: number | null
          project_activity_id?: string | null
        }
        Update: {
          activity_id?: string | null
          content_rating?: number | null
          created_at?: string
          feedback_text?: string | null
          id?: string
          name?: string | null
          organization_rating?: number | null
          overall_rating?: number | null
          phone?: string | null
          presenter_rating?: number | null
          project_activity_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_feedback_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_feedback_project_activity_id_fkey"
            columns: ["project_activity_id"]
            isOneToOne: false
            referencedRelation: "project_activities"
            referencedColumns: ["id"]
          },
        ]
      }
      app_permissions: {
        Row: {
          app_name: string
          created_at: string | null
          id: string
          role_id: string | null
        }
        Insert: {
          app_name: string
          created_at?: string | null
          id?: string
          role_id?: string | null
        }
        Update: {
          app_name?: string
          created_at?: string | null
          id?: string
          role_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          activity_id: string | null
          check_in_time: string | null
          created_at: string
          event_id: string | null
          id: string
          project_id: string | null
          recorded_by: string | null
          registration_id: string | null
          status: string | null
        }
        Insert: {
          activity_id?: string | null
          check_in_time?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          project_id?: string | null
          recorded_by?: string | null
          registration_id?: string | null
          status?: string | null
        }
        Update: {
          activity_id?: string | null
          check_in_time?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          project_id?: string | null
          recorded_by?: string | null
          registration_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "project_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
      budget_items: {
        Row: {
          created_at: string
          default_percentage: number
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          default_percentage: number
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          default_percentage?: number
          id?: string
          name?: string
        }
        Relationships: []
      }
      certificate_signatures: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          position: string
          signature_image: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          position: string
          signature_image: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          position?: string
          signature_image?: string
        }
        Relationships: []
      }
      certificate_templates: {
        Row: {
          created_at: string
          description: string | null
          field_mappings: Json | null
          fields: Json
          font_family: string | null
          id: string
          is_active: boolean | null
          language: string | null
          name: string
          orientation: string | null
          page_size: string | null
          template_file: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          field_mappings?: Json | null
          fields?: Json
          font_family?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          name: string
          orientation?: string | null
          page_size?: string | null
          template_file: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          field_mappings?: Json | null
          fields?: Json
          font_family?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          name?: string
          orientation?: string | null
          page_size?: string | null
          template_file?: string
          updated_at?: string
        }
        Relationships: []
      }
      certificate_verifications: {
        Row: {
          certificate_id: string | null
          id: string
          ip_address: string | null
          verification_code: string
          verification_method: string
          verified_at: string
        }
        Insert: {
          certificate_id?: string | null
          id?: string
          ip_address?: string | null
          verification_code: string
          verification_method: string
          verified_at?: string
        }
        Update: {
          certificate_id?: string | null
          id?: string
          ip_address?: string | null
          verification_code?: string
          verification_method?: string
          verified_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificate_verifications_certificate_id_fkey"
            columns: ["certificate_id"]
            isOneToOne: false
            referencedRelation: "certificates"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          certificate_data: Json
          certificate_number: string
          event_id: string | null
          id: string
          issued_at: string
          issued_by: string | null
          pdf_url: string | null
          project_id: string | null
          qr_code: string | null
          registration_id: string | null
          status: string | null
          template_id: string | null
          verification_code: string
        }
        Insert: {
          certificate_data?: Json
          certificate_number: string
          event_id?: string | null
          id?: string
          issued_at?: string
          issued_by?: string | null
          pdf_url?: string | null
          project_id?: string | null
          qr_code?: string | null
          registration_id?: string | null
          status?: string | null
          template_id?: string | null
          verification_code: string
        }
        Update: {
          certificate_data?: Json
          certificate_number?: string
          event_id?: string | null
          id?: string
          issued_at?: string
          issued_by?: string | null
          pdf_url?: string | null
          project_id?: string | null
          qr_code?: string | null
          registration_id?: string | null
          status?: string | null
          template_id?: string | null
          verification_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "certificate_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      department_projects: {
        Row: {
          asana_gid: string | null
          created_at: string
          department_id: string | null
          id: string
          project_id: string | null
        }
        Insert: {
          asana_gid?: string | null
          created_at?: string
          department_id?: string | null
          id?: string
          project_id?: string | null
        }
        Update: {
          asana_gid?: string | null
          created_at?: string
          department_id?: string | null
          id?: string
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "department_projects_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          asana_folder_gid: string | null
          asana_gid: string | null
          asana_sync_enabled: boolean | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          asana_folder_gid?: string | null
          asana_gid?: string | null
          asana_sync_enabled?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          asana_folder_gid?: string | null
          asana_gid?: string | null
          asana_sync_enabled?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          created_by: string | null
          expiry_date: string | null
          file_path: string | null
          file_size: number | null
          file_type: string | null
          id: string
          issuer: string | null
          name: string
          status: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expiry_date?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          issuer?: string | null
          name: string
          status?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expiry_date?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          issuer?: string | null
          name?: string
          status?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_feedback: {
        Row: {
          content_rating: number | null
          created_at: string
          error_details: string | null
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
          error_details?: string | null
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
          error_details?: string | null
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
      event_registration_fields: {
        Row: {
          arabic_name: boolean | null
          birth_date: boolean | null
          created_at: string
          education_level: boolean | null
          email: boolean | null
          english_name: boolean | null
          event_id: string | null
          gender: boolean | null
          id: string
          national_id: boolean | null
          phone: boolean | null
          work_status: boolean | null
        }
        Insert: {
          arabic_name?: boolean | null
          birth_date?: boolean | null
          created_at?: string
          education_level?: boolean | null
          email?: boolean | null
          english_name?: boolean | null
          event_id?: string | null
          gender?: boolean | null
          id?: string
          national_id?: boolean | null
          phone?: boolean | null
          work_status?: boolean | null
        }
        Update: {
          arabic_name?: boolean | null
          birth_date?: boolean | null
          created_at?: string
          education_level?: boolean | null
          email?: boolean | null
          english_name?: boolean | null
          event_id?: string | null
          gender?: boolean | null
          id?: string
          national_id?: boolean | null
          phone?: boolean | null
          work_status?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registration_fields_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_reports: {
        Row: {
          absent_count: number | null
          activity_duration: number | null
          activity_objectives: string | null
          additional_links: string[] | null
          attendees_count: number | null
          comments: string[] | null
          created_at: string
          detailed_description: string | null
          duration: string | null
          evaluators_count: number | null
          event_hours: number | null
          event_id: string | null
          execution_date: string | null
          execution_time: string | null
          executor_id: string | null
          files: string[] | null
          id: string
          impact_on_participants: string | null
          links: string[] | null
          objectives: string | null
          partners: string | null
          photo_descriptions: string[] | null
          photos: string[] | null
          program_name: string | null
          report_name: string
          report_text: string
          satisfaction_level: number | null
          speaker_name: string | null
          updated_at: string | null
          video_links: string[] | null
        }
        Insert: {
          absent_count?: number | null
          activity_duration?: number | null
          activity_objectives?: string | null
          additional_links?: string[] | null
          attendees_count?: number | null
          comments?: string[] | null
          created_at?: string
          detailed_description?: string | null
          duration?: string | null
          evaluators_count?: number | null
          event_hours?: number | null
          event_id?: string | null
          execution_date?: string | null
          execution_time?: string | null
          executor_id?: string | null
          files?: string[] | null
          id?: string
          impact_on_participants?: string | null
          links?: string[] | null
          objectives?: string | null
          partners?: string | null
          photo_descriptions?: string[] | null
          photos?: string[] | null
          program_name?: string | null
          report_name: string
          report_text: string
          satisfaction_level?: number | null
          speaker_name?: string | null
          updated_at?: string | null
          video_links?: string[] | null
        }
        Update: {
          absent_count?: number | null
          activity_duration?: number | null
          activity_objectives?: string | null
          additional_links?: string[] | null
          attendees_count?: number | null
          comments?: string[] | null
          created_at?: string
          detailed_description?: string | null
          duration?: string | null
          evaluators_count?: number | null
          event_hours?: number | null
          event_id?: string | null
          execution_date?: string | null
          execution_time?: string | null
          executor_id?: string | null
          files?: string[] | null
          id?: string
          impact_on_participants?: string | null
          links?: string[] | null
          objectives?: string | null
          partners?: string | null
          photo_descriptions?: string[] | null
          photos?: string[] | null
          program_name?: string | null
          report_name?: string
          report_text?: string
          satisfaction_level?: number | null
          speaker_name?: string | null
          updated_at?: string | null
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
          {
            foreignKeyName: "event_reports_executor_id_fkey"
            columns: ["executor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_event_reports_event"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          attendees: number | null
          beneficiary_type: string
          certificate_type: string | null
          created_at: string
          date: string
          description: string | null
          end_date: string | null
          event_category: string
          event_hours: number | null
          event_path: string
          event_type: string
          id: string
          image_url: string
          is_project_activity: boolean | null
          is_visible: boolean | null
          location: string
          location_url: string | null
          max_attendees: number
          price: number | null
          project_id: string | null
          registration_end_date: string | null
          registration_start_date: string | null
          special_requirements: string | null
          time: string
          title: string
        }
        Insert: {
          attendees?: number | null
          beneficiary_type?: string
          certificate_type?: string | null
          created_at?: string
          date: string
          description?: string | null
          end_date?: string | null
          event_category?: string
          event_hours?: number | null
          event_path?: string
          event_type: string
          id?: string
          image_url: string
          is_project_activity?: boolean | null
          is_visible?: boolean | null
          location: string
          location_url?: string | null
          max_attendees?: number
          price?: number | null
          project_id?: string | null
          registration_end_date?: string | null
          registration_start_date?: string | null
          special_requirements?: string | null
          time: string
          title: string
        }
        Update: {
          attendees?: number | null
          beneficiary_type?: string
          certificate_type?: string | null
          created_at?: string
          date?: string
          description?: string | null
          end_date?: string | null
          event_category?: string
          event_hours?: number | null
          event_path?: string
          event_type?: string
          id?: string
          image_url?: string
          is_project_activity?: boolean | null
          is_visible?: boolean | null
          location?: string
          location_url?: string | null
          max_attendees?: number
          price?: number | null
          project_id?: string | null
          registration_end_date?: string | null
          registration_start_date?: string | null
          special_requirements?: string | null
          time?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          beneficiary: string | null
          budget_item_id: string
          created_at: string
          date: string
          description: string
          id: string
        }
        Insert: {
          amount: number
          beneficiary?: string | null
          budget_item_id: string
          created_at?: string
          date: string
          description: string
          id?: string
        }
        Update: {
          amount?: number
          beneficiary?: string | null
          budget_item_id?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_budget_item_id_fkey"
            columns: ["budget_item_id"]
            isOneToOne: false
            referencedRelation: "budget_items"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_resources: {
        Row: {
          created_at: string
          date: string
          entity: string
          id: string
          net_amount: number
          obligations_amount: number | null
          source: string
          total_amount: number
          type: string
        }
        Insert: {
          created_at?: string
          date: string
          entity: string
          id?: string
          net_amount: number
          obligations_amount?: number | null
          source: string
          total_amount: number
          type: string
        }
        Update: {
          created_at?: string
          date?: string
          entity?: string
          id?: string
          net_amount?: number
          obligations_amount?: number | null
          source?: string
          total_amount?: number
          type?: string
        }
        Relationships: []
      }
      financial_targets: {
        Row: {
          actual_amount: number
          budget_item_id: string | null
          created_at: string
          id: string
          period_type: string
          quarter: number
          resource_source: string | null
          target_amount: number
          type: string
          updated_at: string
          year: number
        }
        Insert: {
          actual_amount?: number
          budget_item_id?: string | null
          created_at?: string
          id?: string
          period_type?: string
          quarter: number
          resource_source?: string | null
          target_amount?: number
          type: string
          updated_at?: string
          year: number
        }
        Update: {
          actual_amount?: number
          budget_item_id?: string | null
          created_at?: string
          id?: string
          period_type?: string
          quarter?: number
          resource_source?: string | null
          target_amount?: number
          type?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "financial_targets_budget_item_id_fkey"
            columns: ["budget_item_id"]
            isOneToOne: false
            referencedRelation: "budget_items"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      idea_comments: {
        Row: {
          attachment_name: string | null
          attachment_type: string | null
          attachment_url: string | null
          content: string
          created_at: string
          id: string
          idea_id: string | null
          parent_id: string | null
          updated_at: string
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          content: string
          created_at?: string
          id?: string
          idea_id?: string | null
          parent_id?: string | null
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string
          created_at?: string
          id?: string
          idea_id?: string | null
          parent_id?: string | null
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "idea_comments_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "idea_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_decisions: {
        Row: {
          assignee: string | null
          budget: string | null
          created_at: string
          created_by: string | null
          id: string
          idea_id: string | null
          reason: string
          status: string
          timeline: string | null
        }
        Insert: {
          assignee?: string | null
          budget?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          idea_id?: string | null
          reason: string
          status: string
          timeline?: string | null
        }
        Update: {
          assignee?: string | null
          budget?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          idea_id?: string | null
          reason?: string
          status?: string
          timeline?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "idea_decisions_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_tags: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      idea_to_tags: {
        Row: {
          idea_id: string
          tag_id: string
        }
        Insert: {
          idea_id: string
          tag_id: string
        }
        Update: {
          idea_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_to_tags_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_to_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "idea_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_versions: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          id: string
          idea_id: string | null
          title: string
          updated_at: string
          version_number: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          idea_id?: string | null
          title: string
          updated_at?: string
          version_number: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          idea_id?: string | null
          title?: string
          updated_at?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "idea_versions_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_votes: {
        Row: {
          created_at: string
          id: string
          idea_id: string | null
          user_id: string | null
          vote_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          idea_id?: string | null
          user_id?: string | null
          vote_type: string
        }
        Update: {
          created_at?: string
          id?: string
          idea_id?: string | null
          user_id?: string | null
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_votes_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      ideas: {
        Row: {
          assigned_to: string | null
          benefits: string | null
          category: string | null
          contributing_departments: string[] | null
          created_at: string
          created_by: string | null
          description: string
          discussion_period: string | null
          duration: string | null
          expected_costs: Json | null
          expected_partners: Json | null
          id: string
          idea_type: string | null
          opportunity: string | null
          problem: string | null
          proposed_execution_date: string | null
          required_resources: string | null
          similar_ideas: Json | null
          status: string
          supporting_files: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          benefits?: string | null
          category?: string | null
          contributing_departments?: string[] | null
          created_at?: string
          created_by?: string | null
          description: string
          discussion_period?: string | null
          duration?: string | null
          expected_costs?: Json | null
          expected_partners?: Json | null
          id?: string
          idea_type?: string | null
          opportunity?: string | null
          problem?: string | null
          proposed_execution_date?: string | null
          required_resources?: string | null
          similar_ideas?: Json | null
          status?: string
          supporting_files?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          benefits?: string | null
          category?: string | null
          contributing_departments?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string
          discussion_period?: string | null
          duration?: string | null
          expected_costs?: Json | null
          expected_partners?: Json | null
          id?: string
          idea_type?: string | null
          opportunity?: string | null
          problem?: string | null
          proposed_execution_date?: string | null
          required_resources?: string | null
          similar_ideas?: Json | null
          status?: string
          supporting_files?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      in_app_notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          notification_type: string
          read: boolean
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          notification_type: string
          read?: boolean
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          notification_type?: string
          read?: boolean
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          event_id: string | null
          id: string
          last_error: string | null
          last_retry: string | null
          message_content: string | null
          message_id: string | null
          notification_type: string
          recipient_phone: string | null
          registration_id: string | null
          retry_count: number | null
          sent_at: string
          status: string | null
          template_id: string | null
        }
        Insert: {
          event_id?: string | null
          id?: string
          last_error?: string | null
          last_retry?: string | null
          message_content?: string | null
          message_id?: string | null
          notification_type: string
          recipient_phone?: string | null
          registration_id?: string | null
          retry_count?: number | null
          sent_at?: string
          status?: string | null
          template_id?: string | null
        }
        Update: {
          event_id?: string | null
          id?: string
          last_error?: string | null
          last_retry?: string | null
          message_content?: string | null
          message_id?: string | null
          notification_type?: string
          recipient_phone?: string | null
          registration_id?: string | null
          retry_count?: number | null
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
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_gateway: string | null
          payment_method: string | null
          registration_id: string | null
          status: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_gateway?: string | null
          payment_method?: string | null
          registration_id?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_gateway?: string | null
          payment_method?: string | null
          registration_id?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          module: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          module: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          module?: string
          name?: string
        }
        Relationships: []
      }
      portfolio_only_projects: {
        Row: {
          asana_gid: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          name: string
          portfolio_id: string | null
          privacy: string | null
          start_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          asana_gid?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          name: string
          portfolio_id?: string | null
          privacy?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          asana_gid?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          name?: string
          portfolio_id?: string | null
          privacy?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_portfolio_only_projects_portfolio"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_only_projects_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_projects: {
        Row: {
          asana_gid: string | null
          asana_priority: string | null
          asana_status: string | null
          asana_workspace_id: string | null
          created_at: string
          id: string
          last_sync_at: string | null
          portfolio_id: string | null
          project_id: string | null
          project_type: string | null
          sync_error: string | null
          sync_status: string | null
        }
        Insert: {
          asana_gid?: string | null
          asana_priority?: string | null
          asana_status?: string | null
          asana_workspace_id?: string | null
          created_at?: string
          id?: string
          last_sync_at?: string | null
          portfolio_id?: string | null
          project_id?: string | null
          project_type?: string | null
          sync_error?: string | null
          sync_status?: string | null
        }
        Update: {
          asana_gid?: string | null
          asana_priority?: string | null
          asana_status?: string | null
          asana_workspace_id?: string | null
          created_at?: string
          id?: string
          last_sync_at?: string | null
          portfolio_id?: string | null
          project_id?: string | null
          project_type?: string | null
          sync_error?: string | null
          sync_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_projects_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_subtasks: {
        Row: {
          asana_gid: string | null
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          parent_task_id: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          asana_gid?: string | null
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          parent_task_id?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          asana_gid?: string | null
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          parent_task_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_subtasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "portfolio_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_task_attachments: {
        Row: {
          asana_gid: string | null
          attachment_category: string | null
          content_type: string | null
          created_at: string
          created_by: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          task_id: string | null
        }
        Insert: {
          asana_gid?: string | null
          attachment_category?: string | null
          content_type?: string | null
          created_at?: string
          created_by?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          task_id?: string | null
        }
        Update: {
          asana_gid?: string | null
          attachment_category?: string | null
          content_type?: string | null
          created_at?: string
          created_by?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_task_attachments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "portfolio_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_task_comments: {
        Row: {
          asana_gid: string | null
          attachment_name: string | null
          attachment_type: string | null
          attachment_url: string | null
          content: string
          created_at: string
          created_by: string | null
          id: string
          task_id: string | null
        }
        Insert: {
          asana_gid?: string | null
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          task_id?: string | null
        }
        Update: {
          asana_gid?: string | null
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "portfolio_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_tasks: {
        Row: {
          asana_gid: string | null
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          last_sync_at: string | null
          parent_task_id: string | null
          priority: string | null
          project_id: string | null
          status: string | null
          sync_error: string | null
          sync_status: string | null
          title: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          asana_gid?: string | null
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          last_sync_at?: string | null
          parent_task_id?: string | null
          priority?: string | null
          project_id?: string | null
          status?: string | null
          sync_error?: string | null
          sync_status?: string | null
          title: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          asana_gid?: string | null
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          last_sync_at?: string | null
          parent_task_id?: string | null
          priority?: string | null
          project_id?: string | null
          status?: string | null
          sync_error?: string | null
          sync_status?: string | null
          title?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "portfolio_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "portfolio_only_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_tasks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "portfolio_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_workspaces: {
        Row: {
          asana_gid: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          asana_gid?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          asana_gid?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolios: {
        Row: {
          asana_folder_gid: string | null
          asana_gid: string | null
          asana_sync_enabled: boolean | null
          created_at: string
          description: string | null
          id: string
          last_sync_at: string | null
          name: string
          sync_enabled: boolean | null
          sync_error: string | null
          updated_at: string
        }
        Insert: {
          asana_folder_gid?: string | null
          asana_gid?: string | null
          asana_sync_enabled?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          last_sync_at?: string | null
          name: string
          sync_enabled?: boolean | null
          sync_error?: string | null
          updated_at?: string
        }
        Update: {
          asana_folder_gid?: string | null
          asana_gid?: string | null
          asana_sync_enabled?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          last_sync_at?: string | null
          name?: string
          sync_enabled?: boolean | null
          sync_error?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          deleted_at: string | null
          display_name: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_anonymized: boolean | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          is_active?: boolean | null
          is_anonymized?: boolean | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_anonymized?: boolean | null
        }
        Relationships: []
      }
      project_activities: {
        Row: {
          activity_duration: number
          created_at: string
          date: string
          description: string | null
          id: string
          is_visible: boolean | null
          location: string
          location_url: string | null
          project_id: string | null
          special_requirements: string | null
          time: string
          title: string
        }
        Insert: {
          activity_duration?: number
          created_at?: string
          date: string
          description?: string | null
          id?: string
          is_visible?: boolean | null
          location: string
          location_url?: string | null
          project_id?: string | null
          special_requirements?: string | null
          time: string
          title: string
        }
        Update: {
          activity_duration?: number
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          is_visible?: boolean | null
          location?: string
          location_url?: string | null
          project_id?: string | null
          special_requirements?: string | null
          time?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_activities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_activity_reports: {
        Row: {
          activity_duration: string | null
          activity_id: string | null
          activity_objectives: string | null
          additional_links: string[] | null
          attendees_count: string | null
          author_id: string | null
          author_name: string | null
          comments: string[] | null
          created_at: string
          detailed_description: string | null
          executor_id: string | null
          files: string[] | null
          id: string
          impact_on_participants: string | null
          objectives: string | null
          photos: string[] | null
          program_name: string | null
          project_activity_id: string | null
          project_id: string | null
          report_name: string
          report_text: string
          satisfaction_level: number | null
          video_links: string[] | null
        }
        Insert: {
          activity_duration?: string | null
          activity_id?: string | null
          activity_objectives?: string | null
          additional_links?: string[] | null
          attendees_count?: string | null
          author_id?: string | null
          author_name?: string | null
          comments?: string[] | null
          created_at?: string
          detailed_description?: string | null
          executor_id?: string | null
          files?: string[] | null
          id?: string
          impact_on_participants?: string | null
          objectives?: string | null
          photos?: string[] | null
          program_name?: string | null
          project_activity_id?: string | null
          project_id?: string | null
          report_name: string
          report_text: string
          satisfaction_level?: number | null
          video_links?: string[] | null
        }
        Update: {
          activity_duration?: string | null
          activity_id?: string | null
          activity_objectives?: string | null
          additional_links?: string[] | null
          attendees_count?: string | null
          author_id?: string | null
          author_name?: string | null
          comments?: string[] | null
          created_at?: string
          detailed_description?: string | null
          executor_id?: string | null
          files?: string[] | null
          id?: string
          impact_on_participants?: string | null
          objectives?: string | null
          photos?: string[] | null
          program_name?: string | null
          project_activity_id?: string | null
          project_id?: string | null
          report_name?: string
          report_text?: string
          satisfaction_level?: number | null
          video_links?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "project_activity_reports_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_activity_reports_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_activity_reports_executor_id_fkey"
            columns: ["executor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_activity_reports_project_activity_id_fkey"
            columns: ["project_activity_id"]
            isOneToOne: false
            referencedRelation: "project_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_activity_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_notification_settings: {
        Row: {
          activity_reminder_enabled: boolean | null
          created_at: string
          feedback_enabled: boolean | null
          id: string
          project_id: string | null
          registration_enabled: boolean | null
        }
        Insert: {
          activity_reminder_enabled?: boolean | null
          created_at?: string
          feedback_enabled?: boolean | null
          id?: string
          project_id?: string | null
          registration_enabled?: boolean | null
        }
        Update: {
          activity_reminder_enabled?: boolean | null
          created_at?: string
          feedback_enabled?: boolean | null
          id?: string
          project_id?: string | null
          registration_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "project_notification_settings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_registration_fields: {
        Row: {
          arabic_name: boolean | null
          birth_date: boolean | null
          created_at: string
          education_level: boolean | null
          email: boolean | null
          english_name: boolean | null
          gender: boolean | null
          id: string
          national_id: boolean | null
          phone: boolean | null
          project_id: string | null
          work_status: boolean | null
        }
        Insert: {
          arabic_name?: boolean | null
          birth_date?: boolean | null
          created_at?: string
          education_level?: boolean | null
          email?: boolean | null
          english_name?: boolean | null
          gender?: boolean | null
          id?: string
          national_id?: boolean | null
          phone?: boolean | null
          project_id?: string | null
          work_status?: boolean | null
        }
        Update: {
          arabic_name?: boolean | null
          birth_date?: boolean | null
          created_at?: string
          education_level?: boolean | null
          email?: boolean | null
          english_name?: boolean | null
          gender?: boolean | null
          id?: string
          national_id?: boolean | null
          phone?: boolean | null
          project_id?: string | null
          work_status?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "project_registration_fields_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_stages: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          project_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          project_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          project_id?: string
        }
        Relationships: []
      }
      project_tasks: {
        Row: {
          asana_gid: string | null
          assigned_to: string | null
          copied_from: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_draft: boolean | null
          launch_date: string | null
          priority: string | null
          project_id: string | null
          project_manager: string | null
          requires_deliverable: boolean | null
          stage_id: string | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          asana_gid?: string | null
          assigned_to?: string | null
          copied_from?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_draft?: boolean | null
          launch_date?: string | null
          priority?: string | null
          project_id?: string | null
          project_manager?: string | null
          requires_deliverable?: boolean | null
          stage_id?: string | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          asana_gid?: string | null
          assigned_to?: string | null
          copied_from?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_draft?: boolean | null
          launch_date?: string | null
          priority?: string | null
          project_id?: string | null
          project_manager?: string | null
          requires_deliverable?: boolean | null
          stage_id?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_copied_from_fkey"
            columns: ["copied_from"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          attendance_requirement_type: string | null
          beneficiary_type: string
          certificate_type: string | null
          created_at: string
          description: string | null
          end_date: string
          event_category: string
          event_path: string
          event_type: string
          id: string
          image_url: string
          is_visible: boolean | null
          max_attendees: number
          price: number | null
          project_type: string
          registration_end_date: string | null
          registration_start_date: string | null
          required_activities_count: number | null
          required_attendance_percentage: number | null
          start_date: string
          title: string
        }
        Insert: {
          attendance_requirement_type?: string | null
          beneficiary_type?: string
          certificate_type?: string | null
          created_at?: string
          description?: string | null
          end_date: string
          event_category?: string
          event_path?: string
          event_type?: string
          id?: string
          image_url: string
          is_visible?: boolean | null
          max_attendees?: number
          price?: number | null
          project_type?: string
          registration_end_date?: string | null
          registration_start_date?: string | null
          required_activities_count?: number | null
          required_attendance_percentage?: number | null
          start_date: string
          title: string
        }
        Update: {
          attendance_requirement_type?: string | null
          beneficiary_type?: string
          certificate_type?: string | null
          created_at?: string
          description?: string | null
          end_date?: string
          event_category?: string
          event_path?: string
          event_type?: string
          id?: string
          image_url?: string
          is_visible?: boolean | null
          max_attendees?: number
          price?: number | null
          project_type?: string
          registration_end_date?: string | null
          registration_start_date?: string | null
          required_activities_count?: number | null
          required_attendance_percentage?: number | null
          start_date?: string
          title?: string
        }
        Relationships: []
      }
      recurring_tasks: {
        Row: {
          assign_to: string | null
          category: string | null
          created_at: string
          created_by: string | null
          day_of_month: number | null
          day_of_week: number | null
          description: string | null
          id: string
          interval: number
          is_active: boolean | null
          last_generated_date: string | null
          next_generation_date: string | null
          priority: string | null
          project_id: string | null
          recurrence_type: string
          requires_deliverable: boolean | null
          title: string
          workspace_id: string | null
        }
        Insert: {
          assign_to?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          description?: string | null
          id?: string
          interval?: number
          is_active?: boolean | null
          last_generated_date?: string | null
          next_generation_date?: string | null
          priority?: string | null
          project_id?: string | null
          recurrence_type?: string
          requires_deliverable?: boolean | null
          title: string
          workspace_id?: string | null
        }
        Update: {
          assign_to?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          description?: string | null
          id?: string
          interval?: number
          is_active?: boolean | null
          last_generated_date?: string | null
          next_generation_date?: string | null
          priority?: string | null
          project_id?: string | null
          recurrence_type?: string
          requires_deliverable?: boolean | null
          title?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_tasks_assign_to_fkey"
            columns: ["assign_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_tasks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          arabic_name: string
          birth_date: string | null
          created_at: string
          education_level: string | null
          email: string
          english_name: string | null
          event_id: string | null
          gender: string | null
          id: string
          name: string | null
          national_id: string | null
          phone: string
          project_id: string | null
          registration_number: string
          updated_at: string | null
          user_id: string | null
          work_status: string | null
        }
        Insert: {
          arabic_name: string
          birth_date?: string | null
          created_at?: string
          education_level?: string | null
          email: string
          english_name?: string | null
          event_id?: string | null
          gender?: string | null
          id?: string
          name?: string | null
          national_id?: string | null
          phone: string
          project_id?: string | null
          registration_number: string
          updated_at?: string | null
          user_id?: string | null
          work_status?: string | null
        }
        Update: {
          arabic_name?: string
          birth_date?: string | null
          created_at?: string
          education_level?: string | null
          email?: string
          english_name?: string | null
          event_id?: string | null
          gender?: string | null
          id?: string
          name?: string | null
          national_id?: string | null
          phone?: string
          project_id?: string | null
          registration_number?: string
          updated_at?: string | null
          user_id?: string | null
          work_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      request_approvals: {
        Row: {
          approved_at: string | null
          approver_id: string | null
          comments: string | null
          created_at: string | null
          id: string
          request_id: string | null
          status: string
          step_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approver_id?: string | null
          comments?: string | null
          created_at?: string | null
          id?: string
          request_id?: string | null
          status?: string
          step_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approver_id?: string | null
          comments?: string | null
          created_at?: string | null
          id?: string
          request_id?: string | null
          status?: string
          step_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_approvals_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_approvals_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      request_attachments: {
        Row: {
          approval_id: string | null
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          request_id: string | null
          uploaded_by: string | null
        }
        Insert: {
          approval_id?: string | null
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          request_id?: string | null
          uploaded_by?: string | null
        }
        Update: {
          approval_id?: string | null
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          request_id?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_attachments_approval_id_fkey"
            columns: ["approval_id"]
            isOneToOne: false
            referencedRelation: "request_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_attachments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      request_types: {
        Row: {
          created_at: string | null
          created_by: string | null
          default_workflow_id: string | null
          description: string | null
          form_schema: Json
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          default_workflow_id?: string | null
          description?: string | null
          form_schema?: Json
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          default_workflow_id?: string | null
          description?: string | null
          form_schema?: Json
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      request_workflows: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          request_type_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          request_type_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          request_type_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_workflows_request_type_id_fkey"
            columns: ["request_type_id"]
            isOneToOne: false
            referencedRelation: "request_types"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          created_at: string | null
          current_step_id: string | null
          due_date: string | null
          form_data: Json
          id: string
          priority: string | null
          request_type_id: string | null
          requester_id: string | null
          status: string
          title: string
          updated_at: string | null
          workflow_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_step_id?: string | null
          due_date?: string | null
          form_data?: Json
          id?: string
          priority?: string | null
          request_type_id?: string | null
          requester_id?: string | null
          status?: string
          title: string
          updated_at?: string | null
          workflow_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_step_id?: string | null
          due_date?: string | null
          form_data?: Json
          id?: string
          priority?: string | null
          request_type_id?: string | null
          requester_id?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requests_current_step_id_fkey"
            columns: ["current_step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_request_type_id_fkey"
            columns: ["request_type_id"]
            isOneToOne: false
            referencedRelation: "request_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "request_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_distributions: {
        Row: {
          amount: number
          budget_item_id: string
          created_at: string
          id: string
          percentage: number
          resource_id: string
        }
        Insert: {
          amount: number
          budget_item_id: string
          created_at?: string
          id?: string
          percentage: number
          resource_id: string
        }
        Update: {
          amount?: number
          budget_item_id?: string
          created_at?: string
          id?: string
          percentage?: number
          resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_distributions_budget_item_id_fkey"
            columns: ["budget_item_id"]
            isOneToOne: false
            referencedRelation: "budget_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_distributions_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "financial_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_obligations: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          resource_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          resource_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_obligations_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "financial_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
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
      sequential_ids: {
        Row: {
          created_at: string
          id: string
          sequential_number: number
          type: string
        }
        Insert: {
          created_at?: string
          id: string
          sequential_number: number
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          sequential_number?: number
          type?: string
        }
        Relationships: []
      }
      subscription_attachments: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          subscription_id: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          subscription_id?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          subscription_id?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_attachments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_cycle: string
          category: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          cost: number | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          description: string | null
          expiry_date: string | null
          id: string
          name: string
          notes: string | null
          payment_method: string | null
          provider: string | null
          reminder_days: number[] | null
          renewal_date: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          billing_cycle: string
          category: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          name: string
          notes?: string | null
          payment_method?: string | null
          provider?: string | null
          reminder_days?: number[] | null
          renewal_date?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: string
          category?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          payment_method?: string | null
          provider?: string | null
          reminder_days?: number[] | null
          renewal_date?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subtasks: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          due_date: string | null
          id: string
          status: string | null
          task_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          status?: string | null
          task_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          status?: string | null
          task_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sync_status: {
        Row: {
          created_at: string
          department_id: string | null
          id: string
          last_sync: string | null
          sync_attachments: boolean | null
          sync_comments: boolean | null
          sync_enabled: boolean | null
          sync_interval: number | null
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          id?: string
          last_sync?: string | null
          sync_attachments?: boolean | null
          sync_comments?: boolean | null
          sync_enabled?: boolean | null
          sync_interval?: number | null
        }
        Update: {
          created_at?: string
          department_id?: string | null
          id?: string
          last_sync?: string | null
          sync_attachments?: boolean | null
          sync_comments?: boolean | null
          sync_enabled?: boolean | null
          sync_interval?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sync_status_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      task_attachments: {
        Row: {
          asana_gid: string | null
          attachment_category: string | null
          content_type: string | null
          created_at: string
          created_by: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          task_id: string | null
        }
        Insert: {
          asana_gid?: string | null
          attachment_category?: string | null
          content_type?: string | null
          created_at?: string
          created_by?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          task_id?: string | null
        }
        Update: {
          asana_gid?: string | null
          attachment_category?: string | null
          content_type?: string | null
          created_at?: string
          created_by?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_attachments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      task_comments: {
        Row: {
          asana_gid: string | null
          attachment_name: string | null
          attachment_type: string | null
          attachment_url: string | null
          content: string
          created_at: string
          created_by: string | null
          id: string
          task_id: string | null
        }
        Insert: {
          asana_gid?: string | null
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          task_id?: string | null
        }
        Update: {
          asana_gid?: string | null
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_deliverables: {
        Row: {
          created_at: string
          created_by: string | null
          feedback: string | null
          file_name: string
          file_type: string | null
          file_url: string
          id: string
          status: string | null
          task_id: string
          task_table: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          feedback?: string | null
          file_name: string
          file_type?: string | null
          file_url: string
          id?: string
          status?: string | null
          task_id: string
          task_table?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          feedback?: string | null
          file_name?: string
          file_type?: string | null
          file_url?: string
          id?: string
          status?: string | null
          task_id?: string
          task_table?: string
        }
        Relationships: []
      }
      task_dependencies: {
        Row: {
          created_at: string | null
          dependency_task_id: string
          dependency_type: string
          id: string
          task_id: string
        }
        Insert: {
          created_at?: string | null
          dependency_task_id: string
          dependency_type?: string
          id?: string
          task_id: string
        }
        Update: {
          created_at?: string | null
          dependency_task_id?: string
          dependency_type?: string
          id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_dependencies_dependency_task_id_fkey"
            columns: ["dependency_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_dependencies_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_discussion_attachments: {
        Row: {
          comment_id: string | null
          created_at: string
          created_by: string | null
          file_name: string
          file_type: string | null
          file_url: string
          id: string
          task_id: string
          task_table: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          created_by?: string | null
          file_name: string
          file_type?: string | null
          file_url: string
          id?: string
          task_id: string
          task_table?: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          created_by?: string | null
          file_name?: string
          file_type?: string | null
          file_url?: string
          id?: string
          task_id?: string
          task_table?: string
        }
        Relationships: []
      }
      task_history: {
        Row: {
          action: string
          changed_by: string | null
          completion_time_hours: number | null
          created_at: string
          delay_hours: number | null
          field_name: string | null
          id: string
          new_value: string | null
          old_value: string | null
          task_id: string
        }
        Insert: {
          action: string
          changed_by?: string | null
          completion_time_hours?: number | null
          created_at?: string
          delay_hours?: number | null
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          task_id: string
        }
        Update: {
          action?: string
          changed_by?: string | null
          completion_time_hours?: number | null
          created_at?: string
          delay_hours?: number | null
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_task_history_task"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "portfolio_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_task_history_user"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_subtasks: {
        Row: {
          asana_gid: string | null
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          parent_task_id: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          asana_gid?: string | null
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          parent_task_id?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          asana_gid?: string | null
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          parent_task_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_subtasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          created_at: string
          created_by: string | null
          file_name: string
          file_type: string | null
          file_url: string
          id: string
          task_id: string
          task_table: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          file_name: string
          file_type?: string | null
          file_url: string
          id?: string
          task_id: string
          task_table?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          file_name?: string
          file_type?: string | null
          file_url?: string
          id?: string
          task_id?: string
          task_table?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          asana_gid: string | null
          assigned_to: string | null
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          is_general: boolean | null
          priority: string | null
          project_id: string | null
          requires_deliverable: boolean | null
          stage_id: string | null
          status: string | null
          title: string
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          asana_gid?: string | null
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_general?: boolean | null
          priority?: string | null
          project_id?: string | null
          requires_deliverable?: boolean | null
          stage_id?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          asana_gid?: string | null
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_general?: boolean | null
          priority?: string | null
          project_id?: string | null
          requires_deliverable?: boolean | null
          stage_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: []
      }
      unified_task_attachments: {
        Row: {
          attachment_category: string | null
          created_at: string | null
          created_by: string | null
          file_name: string
          file_type: string | null
          file_url: string
          id: string
          task_id: string
          task_table: string
        }
        Insert: {
          attachment_category?: string | null
          created_at?: string | null
          created_by?: string | null
          file_name: string
          file_type?: string | null
          file_url: string
          id?: string
          task_id: string
          task_table?: string
        }
        Update: {
          attachment_category?: string | null
          created_at?: string | null
          created_by?: string | null
          file_name?: string
          file_type?: string | null
          file_url?: string
          id?: string
          task_id?: string
          task_table?: string
        }
        Relationships: []
      }
      unified_task_comments: {
        Row: {
          attachment_name: string | null
          attachment_type: string | null
          attachment_url: string | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          task_id: string
          task_table: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          task_id: string
          task_table: string
        }
        Update: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          task_id?: string
          task_table?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achieved_at: string | null
          achievement_description: string | null
          achievement_title: string
          achievement_type: string
          created_at: string | null
          id: string
          metrics: Json | null
          user_id: string
        }
        Insert: {
          achieved_at?: string | null
          achievement_description?: string | null
          achievement_title: string
          achievement_type: string
          created_at?: string | null
          id?: string
          metrics?: Json | null
          user_id: string
        }
        Update: {
          achieved_at?: string | null
          achievement_description?: string | null
          achievement_title?: string
          achievement_type?: string
          created_at?: string | null
          id?: string
          metrics?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          activity_type: string
          created_at: string
          details: string | null
          id: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          details?: string | null
          id?: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          details?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notification_preferences: {
        Row: {
          created_at: string
          do_not_disturb_end: string | null
          do_not_disturb_start: string | null
          enable_email: boolean
          enable_in_app: boolean
          enable_whatsapp: boolean
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          do_not_disturb_end?: string | null
          do_not_disturb_start?: string | null
          enable_email?: boolean
          enable_in_app?: boolean
          enable_whatsapp?: boolean
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          do_not_disturb_end?: string | null
          do_not_disturb_start?: string | null
          enable_email?: boolean
          enable_in_app?: boolean
          enable_whatsapp?: boolean
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_performance_stats: {
        Row: {
          average_completion_time: number | null
          completed_tasks_count: number | null
          completion_rate: number | null
          id: string
          last_updated: string | null
          on_time_completion_rate: number | null
          stats_data: Json | null
          stats_period: string | null
          total_tasks_count: number | null
          user_id: string
        }
        Insert: {
          average_completion_time?: number | null
          completed_tasks_count?: number | null
          completion_rate?: number | null
          id?: string
          last_updated?: string | null
          on_time_completion_rate?: number | null
          stats_data?: Json | null
          stats_period?: string | null
          total_tasks_count?: number | null
          user_id: string
        }
        Update: {
          average_completion_time?: number | null
          completed_tasks_count?: number | null
          completion_rate?: number | null
          id?: string
          last_updated?: string | null
          on_time_completion_rate?: number | null
          stats_data?: Json | null
          stats_period?: string | null
          total_tasks_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string
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
          notification_type: string | null
          status: string | null
          target_type: string | null
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
          notification_type?: string | null
          status?: string | null
          target_type?: string | null
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
          notification_type?: string | null
          status?: string | null
          target_type?: string | null
          template_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      workflow_steps: {
        Row: {
          approver_id: string | null
          approver_type: string
          created_at: string | null
          id: string
          instructions: string | null
          is_required: boolean | null
          step_name: string
          step_order: number
          step_type: string
          workflow_id: string | null
        }
        Insert: {
          approver_id?: string | null
          approver_type: string
          created_at?: string | null
          id?: string
          instructions?: string | null
          is_required?: boolean | null
          step_name: string
          step_order: number
          step_type?: string
          workflow_id?: string | null
        }
        Update: {
          approver_id?: string | null
          approver_type?: string
          created_at?: string | null
          id?: string
          instructions?: string | null
          is_required?: boolean | null
          step_name?: string
          step_order?: number
          step_type?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_steps_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "request_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          id: string
          joined_at: string
          role: string
          user_display_name: string | null
          user_email: string | null
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string
          user_display_name?: string | null
          user_email?: string | null
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string
          user_display_name?: string | null
          user_email?: string | null
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_sync_status: {
        Row: {
          created_at: string
          etag: string | null
          id: string
          last_sync_at: string | null
          last_sync_status: string | null
          sync_error: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          etag?: string | null
          id?: string
          last_sync_at?: string | null
          last_sync_status?: string | null
          sync_error?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          etag?: string | null
          id?: string
          last_sync_at?: string | null
          last_sync_status?: string | null
          sync_error?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_sync_status_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "portfolio_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          completed_tasks: number | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          members_count: number | null
          name: string
          pending_tasks: number | null
          status: string
          total_tasks: number | null
        }
        Insert: {
          completed_tasks?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          members_count?: number | null
          name: string
          pending_tasks?: number | null
          status?: string
          total_tasks?: number | null
        }
        Update: {
          completed_tasks?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          members_count?: number | null
          name?: string
          pending_tasks?: number | null
          status?: string
          total_tasks?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      anonymize_user_data: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      assign_user_role: {
        Args: {
          p_user_id: string
          p_role_id: string
        }
        Returns: boolean
      }
      check_table_exists: {
        Args: {
          table_name: string
        }
        Returns: {
          table_exists: boolean
        }[]
      }
      delete_draft_project: {
        Args: {
          p_project_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      delete_project: {
        Args: {
          p_project_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      delete_request_type: {
        Args: {
          p_request_type_id: string
        }
        Returns: Json
      }
      delete_task: {
        Args: {
          p_task_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      delete_user_roles: {
        Args: {
          p_user_id: string
        }
        Returns: boolean
      }
      delete_workspace: {
        Args: {
          p_workspace_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      generate_next_registration_number:
        | {
            Args: {
              event_id: string
            }
            Returns: string
          }
        | {
            Args: {
              p_type: string
              p_id: string
            }
            Returns: string
          }
      generate_recurring_tasks: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_request_details: {
        Args: {
          p_request_id: string
        }
        Returns: Json
      }
      get_user_incoming_requests: {
        Args: {
          p_user_id: string
        }
        Returns: {
          created_at: string | null
          current_step_id: string | null
          due_date: string | null
          form_data: Json
          id: string
          priority: string | null
          request_type_id: string | null
          requester_id: string | null
          status: string
          title: string
          updated_at: string | null
          workflow_id: string | null
        }[]
      }
      get_user_outgoing_requests: {
        Args: {
          p_user_id: string
        }
        Returns: {
          created_at: string | null
          current_step_id: string | null
          due_date: string | null
          form_data: Json
          id: string
          priority: string | null
          request_type_id: string | null
          requester_id: string | null
          status: string
          title: string
          updated_at: string | null
          workflow_id: string | null
        }[]
      }
      get_user_role: {
        Args: {
          p_user_id: string
        }
        Returns: string
      }
      handle_user_management: {
        Args: {
          operation: string
          target_user_id: string
          new_password?: string
        }
        Returns: Json
      }
      insert_request_bypass_rls: {
        Args: {
          request_data: Json
        }
        Returns: Json
      }
      insert_workflow_steps: {
        Args: {
          steps: Json[]
        }
        Returns: Json
      }
      is_admin:
        | {
            Args: Record<PropertyKey, never>
            Returns: boolean
          }
        | {
            Args: {
              user_id: string
            }
            Returns: boolean
          }
      is_admin_user: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      is_request_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_request_approver:
        | {
            Args: {
              step_id: string
            }
            Returns: boolean
          }
        | {
            Args: {
              step_id: string
              user_id: string
            }
            Returns: boolean
          }
      is_request_creator: {
        Args: {
          request_id: string
        }
        Returns: boolean
      }
      is_step_approver: {
        Args: {
          step_id: string
        }
        Returns: boolean
      }
      log_user_activity: {
        Args: {
          user_id: string
          activity_type: string
          details: string
        }
        Returns: string
      }
      set_default_workflow: {
        Args: {
          p_request_type_id: string
          p_workflow_id: string
        }
        Returns: boolean
      }
      soft_delete_user: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      update_workspace_members_count: {
        Args: {
          workspace_id: string
        }
        Returns: undefined
      }
      upsert_request_type: {
        Args: {
          request_type_data: Json
          is_update?: boolean
        }
        Returns: Json
      }
      upsert_workflow: {
        Args: {
          workflow_data: Json
          is_update?: boolean
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
