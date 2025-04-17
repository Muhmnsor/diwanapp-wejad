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
      accounting_accounts: {
        Row: {
          account_type: string
          code: string
          created_at: string
          id: string
          is_active: boolean
          level: number
          name: string
          notes: string | null
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          account_type: string
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          level?: number
          name: string
          notes?: string | null
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          account_type?: string
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          level?: number
          name?: string
          notes?: string | null
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounting_accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "accounting_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      accounting_cost_centers: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      accounting_invoices: {
        Row: {
          account_id: string | null
          cost_center_id: string | null
          created_at: string | null
          customer_address: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          date: string
          due_date: string
          id: string
          invoice_number: string
          invoice_type: string
          items: Json
          notes: string | null
          status: string
          subtotal: number
          tax_amount: number
          tax_rate: number
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          account_id?: string | null
          cost_center_id?: string | null
          created_at?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          date: string
          due_date: string
          id?: string
          invoice_number: string
          invoice_type: string
          items?: Json
          notes?: string | null
          status: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          account_id?: string | null
          cost_center_id?: string | null
          created_at?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          date?: string
          due_date?: string
          id?: string
          invoice_number?: string
          invoice_type?: string
          items?: Json
          notes?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounting_invoices_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounting_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_invoices_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "accounting_cost_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      accounting_journal_entries: {
        Row: {
          approved_by: string | null
          created_at: string
          created_by: string | null
          date: string
          description: string
          id: string
          invoice_id: string | null
          is_invoice_entry: boolean | null
          is_voucher_entry: boolean | null
          reference_number: string | null
          status: string
          total_amount: number | null
          updated_at: string
          voucher_id: string | null
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          date: string
          description: string
          id?: string
          invoice_id?: string | null
          is_invoice_entry?: boolean | null
          is_voucher_entry?: boolean | null
          reference_number?: string | null
          status?: string
          total_amount?: number | null
          updated_at?: string
          voucher_id?: string | null
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string
          id?: string
          invoice_id?: string | null
          is_invoice_entry?: boolean | null
          is_voucher_entry?: boolean | null
          reference_number?: string | null
          status?: string
          total_amount?: number | null
          updated_at?: string
          voucher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounting_journal_entries_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "accounting_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_journal_entries_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "accounting_payment_vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      accounting_journal_items: {
        Row: {
          account_id: string
          cost_center_id: string | null
          credit_amount: number
          debit_amount: number
          description: string | null
          id: string
          journal_entry_id: string
        }
        Insert: {
          account_id: string
          cost_center_id?: string | null
          credit_amount?: number
          debit_amount?: number
          description?: string | null
          id?: string
          journal_entry_id: string
        }
        Update: {
          account_id?: string
          cost_center_id?: string | null
          credit_amount?: number
          debit_amount?: number
          description?: string | null
          id?: string
          journal_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounting_journal_items_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounting_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_journal_items_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "accounting_journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      accounting_opening_balances: {
        Row: {
          account_id: string
          created_at: string
          credit_amount: number
          debit_amount: number
          id: string
          period_id: string
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          credit_amount?: number
          debit_amount?: number
          id?: string
          period_id: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          credit_amount?: number
          debit_amount?: number
          id?: string
          period_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounting_opening_balances_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounting_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_opening_balances_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "accounting_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      accounting_payment_vouchers: {
        Row: {
          account_id: string | null
          bank_account_number: string | null
          beneficiary_name: string
          check_number: string | null
          cost_center_id: string | null
          created_at: string | null
          date: string
          id: string
          invoice_id: string | null
          items: Json
          notes: string | null
          payment_method: string
          status: string
          total_amount: number
          updated_at: string | null
          voucher_number: string
          voucher_type: string
        }
        Insert: {
          account_id?: string | null
          bank_account_number?: string | null
          beneficiary_name: string
          check_number?: string | null
          cost_center_id?: string | null
          created_at?: string | null
          date: string
          id?: string
          invoice_id?: string | null
          items?: Json
          notes?: string | null
          payment_method: string
          status: string
          total_amount?: number
          updated_at?: string | null
          voucher_number: string
          voucher_type: string
        }
        Update: {
          account_id?: string | null
          bank_account_number?: string | null
          beneficiary_name?: string
          check_number?: string | null
          cost_center_id?: string | null
          created_at?: string | null
          date?: string
          id?: string
          invoice_id?: string | null
          items?: Json
          notes?: string | null
          payment_method?: string
          status?: string
          total_amount?: number
          updated_at?: string | null
          voucher_number?: string
          voucher_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounting_payment_vouchers_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounting_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_payment_vouchers_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "accounting_cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_payment_vouchers_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "accounting_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      accounting_periods: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_closed: boolean
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_closed?: boolean
          name: string
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_closed?: boolean
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      accounting_receipts: {
        Row: {
          account_id: string | null
          bank_account_number: string | null
          check_number: string | null
          cost_center_id: string | null
          created_at: string | null
          date: string
          id: string
          invoice_id: string | null
          items: Json
          notes: string | null
          payer_address: string | null
          payer_email: string | null
          payer_name: string
          payer_phone: string | null
          payment_method: string
          receipt_number: string
          receipt_type: string
          status: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          account_id?: string | null
          bank_account_number?: string | null
          check_number?: string | null
          cost_center_id?: string | null
          created_at?: string | null
          date: string
          id?: string
          invoice_id?: string | null
          items?: Json
          notes?: string | null
          payer_address?: string | null
          payer_email?: string | null
          payer_name: string
          payer_phone?: string | null
          payment_method: string
          receipt_number: string
          receipt_type: string
          status?: string
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          account_id?: string | null
          bank_account_number?: string | null
          check_number?: string | null
          cost_center_id?: string | null
          created_at?: string | null
          date?: string
          id?: string
          invoice_id?: string | null
          items?: Json
          notes?: string | null
          payer_address?: string | null
          payer_email?: string | null
          payer_name?: string
          payer_phone?: string | null
          payment_method?: string
          receipt_number?: string
          receipt_type?: string
          status?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounting_receipts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounting_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_receipts_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "accounting_cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_receipts_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "accounting_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
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
      app_settings: {
        Row: {
          app_name: string
          created_at: string
          description: string | null
          display_name: string
          icon: string | null
          id: string
          is_visible: boolean | null
          path: string | null
          updated_at: string
        }
        Insert: {
          app_name: string
          created_at?: string
          description?: string | null
          display_name: string
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          path?: string | null
          updated_at?: string
        }
        Update: {
          app_name?: string
          created_at?: string
          description?: string | null
          display_name?: string
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          path?: string | null
          updated_at?: string
        }
        Relationships: []
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
            foreignKeyName: "attendance_records_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
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
          category: string | null
          created_at: string
          description: string | null
          field_mappings: Json | null
          fields: Json
          font_family: string | null
          id: string
          is_active: boolean | null
          is_archived: boolean | null
          language: string | null
          name: string
          orientation: string | null
          page_size: string | null
          template_file: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          field_mappings?: Json | null
          fields?: Json
          font_family?: string | null
          id?: string
          is_active?: boolean | null
          is_archived?: boolean | null
          language?: string | null
          name: string
          orientation?: string | null
          page_size?: string | null
          template_file: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          field_mappings?: Json | null
          fields?: Json
          font_family?: string | null
          id?: string
          is_active?: boolean | null
          is_archived?: boolean | null
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
            foreignKeyName: "certificates_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
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
      correspondence: {
        Row: {
          archive_date: string | null
          archive_notes: string | null
          archive_number: string | null
          archived_at: string | null
          assigned_to: string | null
          content: string | null
          created_by: string | null
          creation_date: string | null
          date: string
          deadline_date: string | null
          id: string
          include_attachments_in_archive: boolean | null
          is_confidential: boolean | null
          number: string
          priority: string | null
          recipient: string
          related_correspondence_id: string | null
          sender: string
          status: string
          subject: string
          tags: string[] | null
          type: string
          updated_at: string | null
        }
        Insert: {
          archive_date?: string | null
          archive_notes?: string | null
          archive_number?: string | null
          archived_at?: string | null
          assigned_to?: string | null
          content?: string | null
          created_by?: string | null
          creation_date?: string | null
          date: string
          deadline_date?: string | null
          id?: string
          include_attachments_in_archive?: boolean | null
          is_confidential?: boolean | null
          number: string
          priority?: string | null
          recipient: string
          related_correspondence_id?: string | null
          sender: string
          status: string
          subject: string
          tags?: string[] | null
          type: string
          updated_at?: string | null
        }
        Update: {
          archive_date?: string | null
          archive_notes?: string | null
          archive_number?: string | null
          archived_at?: string | null
          assigned_to?: string | null
          content?: string | null
          created_by?: string | null
          creation_date?: string | null
          date?: string
          deadline_date?: string | null
          id?: string
          include_attachments_in_archive?: boolean | null
          is_confidential?: boolean | null
          number?: string
          priority?: string | null
          recipient?: string
          related_correspondence_id?: string | null
          sender?: string
          status?: string
          subject?: string
          tags?: string[] | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "correspondence_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "correspondence_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "correspondence_related_correspondence_id_fkey"
            columns: ["related_correspondence_id"]
            isOneToOne: false
            referencedRelation: "correspondence"
            referencedColumns: ["id"]
          },
        ]
      }
      correspondence_attachments: {
        Row: {
          correspondence_id: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          is_main_document: boolean | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          correspondence_id: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_main_document?: boolean | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          correspondence_id?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_main_document?: boolean | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "correspondence_attachments_correspondence_id_fkey"
            columns: ["correspondence_id"]
            isOneToOne: false
            referencedRelation: "correspondence"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "correspondence_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      correspondence_distribution: {
        Row: {
          correspondence_id: string
          distributed_by: string | null
          distributed_to: string | null
          distributed_to_department: string | null
          distribution_date: string | null
          id: string
          instructions: string | null
          is_read: boolean | null
          read_at: string | null
          response_date: string | null
          response_deadline: string | null
          response_text: string | null
          status: string | null
        }
        Insert: {
          correspondence_id: string
          distributed_by?: string | null
          distributed_to?: string | null
          distributed_to_department?: string | null
          distribution_date?: string | null
          id?: string
          instructions?: string | null
          is_read?: boolean | null
          read_at?: string | null
          response_date?: string | null
          response_deadline?: string | null
          response_text?: string | null
          status?: string | null
        }
        Update: {
          correspondence_id?: string
          distributed_by?: string | null
          distributed_to?: string | null
          distributed_to_department?: string | null
          distribution_date?: string | null
          id?: string
          instructions?: string | null
          is_read?: boolean | null
          read_at?: string | null
          response_date?: string | null
          response_deadline?: string | null
          response_text?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "correspondence_distribution_correspondence_id_fkey"
            columns: ["correspondence_id"]
            isOneToOne: false
            referencedRelation: "correspondence"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "correspondence_distribution_distributed_by_fkey"
            columns: ["distributed_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "correspondence_distribution_distributed_to_fkey"
            columns: ["distributed_to"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      correspondence_history: {
        Row: {
          action_by: string | null
          action_date: string | null
          action_details: string | null
          action_type: string
          correspondence_id: string
          id: string
          new_status: string | null
          previous_status: string | null
        }
        Insert: {
          action_by?: string | null
          action_date?: string | null
          action_details?: string | null
          action_type: string
          correspondence_id: string
          id?: string
          new_status?: string | null
          previous_status?: string | null
        }
        Update: {
          action_by?: string | null
          action_date?: string | null
          action_details?: string | null
          action_type?: string
          correspondence_id?: string
          id?: string
          new_status?: string | null
          previous_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "correspondence_history_action_by_fkey"
            columns: ["action_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "correspondence_history_correspondence_id_fkey"
            columns: ["correspondence_id"]
            isOneToOne: false
            referencedRelation: "correspondence"
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
      developer_permissions: {
        Row: {
          can_access_admin_panel: boolean
          can_access_api_logs: boolean
          can_access_developer_tools: boolean
          can_debug_queries: boolean
          can_export_data: boolean
          can_import_data: boolean
          can_manage_developer_settings: boolean
          can_manage_realtime: boolean
          can_modify_system_settings: boolean
          can_view_performance_metrics: boolean
          created_at: string
          id: string
          is_developer: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          can_access_admin_panel?: boolean
          can_access_api_logs?: boolean
          can_access_developer_tools?: boolean
          can_debug_queries?: boolean
          can_export_data?: boolean
          can_import_data?: boolean
          can_manage_developer_settings?: boolean
          can_manage_realtime?: boolean
          can_modify_system_settings?: boolean
          can_view_performance_metrics?: boolean
          created_at?: string
          id?: string
          is_developer?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          can_access_admin_panel?: boolean
          can_access_api_logs?: boolean
          can_access_developer_tools?: boolean
          can_debug_queries?: boolean
          can_export_data?: boolean
          can_import_data?: boolean
          can_manage_developer_settings?: boolean
          can_manage_realtime?: boolean
          can_modify_system_settings?: boolean
          can_view_performance_metrics?: boolean
          created_at?: string
          id?: string
          is_developer?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "developer_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      developer_settings: {
        Row: {
          cache_time_minutes: number | null
          created_at: string
          debug_level: string | null
          id: string
          is_enabled: boolean
          realtime_enabled: boolean | null
          show_toolbar: boolean | null
          update_interval_seconds: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cache_time_minutes?: number | null
          created_at?: string
          debug_level?: string | null
          id?: string
          is_enabled?: boolean
          realtime_enabled?: boolean | null
          show_toolbar?: boolean | null
          update_interval_seconds?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cache_time_minutes?: number | null
          created_at?: string
          debug_level?: string | null
          id?: string
          is_enabled?: boolean
          realtime_enabled?: boolean | null
          show_toolbar?: boolean | null
          update_interval_seconds?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "developer_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      electronic_signatures: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          signature_image: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          signature_image?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          signature_image?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "electronic_signatures_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_contracts: {
        Row: {
          contract_type: string
          created_at: string | null
          created_by: string | null
          document_url: string | null
          employee_id: string
          end_date: string
          id: string
          notes: string | null
          probation_end_date: string | null
          probation_period: number | null
          salary: number | null
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          contract_type: string
          created_at?: string | null
          created_by?: string | null
          document_url?: string | null
          employee_id: string
          end_date: string
          id?: string
          notes?: string | null
          probation_end_date?: string | null
          probation_period?: number | null
          salary?: number | null
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          contract_type?: string
          created_at?: string | null
          created_by?: string | null
          document_url?: string | null
          employee_id?: string
          end_date?: string
          id?: string
          notes?: string | null
          probation_end_date?: string | null
          probation_period?: number | null
          salary?: number | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_contracts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_contracts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_organizational_units: {
        Row: {
          created_at: string
          employee_id: string
          end_date: string | null
          id: string
          is_primary: boolean | null
          organizational_unit_id: string
          role: string | null
          start_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          end_date?: string | null
          id?: string
          is_primary?: boolean | null
          organizational_unit_id: string
          role?: string | null
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          end_date?: string | null
          id?: string
          is_primary?: boolean | null
          organizational_unit_id?: string
          role?: string | null
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_organizational_units_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_organizational_units_organizational_unit_id_fkey"
            columns: ["organizational_unit_id"]
            isOneToOne: false
            referencedRelation: "organizational_units"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          contract_end_date: string | null
          contract_type: string | null
          created_at: string | null
          default_schedule_id: string | null
          department: string | null
          email: string | null
          employee_number: string | null
          full_name: string
          gender: string | null
          hire_date: string | null
          id: string
          phone: string | null
          position: string | null
          schedule_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          contract_end_date?: string | null
          contract_type?: string | null
          created_at?: string | null
          default_schedule_id?: string | null
          department?: string | null
          email?: string | null
          employee_number?: string | null
          full_name: string
          gender?: string | null
          hire_date?: string | null
          id?: string
          phone?: string | null
          position?: string | null
          schedule_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          contract_end_date?: string | null
          contract_type?: string | null
          created_at?: string | null
          default_schedule_id?: string | null
          department?: string | null
          email?: string | null
          employee_number?: string | null
          full_name?: string
          gender?: string | null
          hire_date?: string | null
          id?: string
          phone?: string | null
          position?: string | null
          schedule_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_default_schedule_id_fkey"
            columns: ["default_schedule_id"]
            isOneToOne: false
            referencedRelation: "hr_work_schedule_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "hr_work_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
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
      hr_attendance: {
        Row: {
          attendance_date: string
          check_in: string | null
          check_in_schedule: string | null
          check_out: string | null
          check_out_schedule: string | null
          created_at: string | null
          created_by: string | null
          early_departure_minutes: number | null
          employee_id: string | null
          id: string
          is_tardy: boolean | null
          left_early: boolean | null
          notes: string | null
          status: string | null
          tardiness_minutes: number | null
        }
        Insert: {
          attendance_date: string
          check_in?: string | null
          check_in_schedule?: string | null
          check_out?: string | null
          check_out_schedule?: string | null
          created_at?: string | null
          created_by?: string | null
          early_departure_minutes?: number | null
          employee_id?: string | null
          id?: string
          is_tardy?: boolean | null
          left_early?: boolean | null
          notes?: string | null
          status?: string | null
          tardiness_minutes?: number | null
        }
        Update: {
          attendance_date?: string
          check_in?: string | null
          check_in_schedule?: string | null
          check_out?: string | null
          check_out_schedule?: string | null
          created_at?: string | null
          created_by?: string | null
          early_departure_minutes?: number | null
          employee_id?: string | null
          id?: string
          is_tardy?: boolean | null
          left_early?: boolean | null
          notes?: string | null
          status?: string | null
          tardiness_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_attendance_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_attendance_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      hr_compensation: {
        Row: {
          benefits: Json | null
          compensation_type: string | null
          created_at: string | null
          currency: string | null
          effective_date: string | null
          employee_id: string | null
          end_date: string | null
          id: string
          salary: number | null
          updated_at: string | null
        }
        Insert: {
          benefits?: Json | null
          compensation_type?: string | null
          created_at?: string | null
          currency?: string | null
          effective_date?: string | null
          employee_id?: string | null
          end_date?: string | null
          id?: string
          salary?: number | null
          updated_at?: string | null
        }
        Update: {
          benefits?: Json | null
          compensation_type?: string | null
          created_at?: string | null
          currency?: string | null
          effective_date?: string | null
          employee_id?: string | null
          end_date?: string | null
          id?: string
          salary?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_compensation_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_employee_contracts: {
        Row: {
          contract_type: string
          created_at: string | null
          document_url: string | null
          employee_id: string
          end_date: string | null
          id: string
          notes: string | null
          probation_end_date: string | null
          renewal_reminder_sent: boolean | null
          salary: number | null
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          contract_type: string
          created_at?: string | null
          document_url?: string | null
          employee_id: string
          end_date?: string | null
          id?: string
          notes?: string | null
          probation_end_date?: string | null
          renewal_reminder_sent?: boolean | null
          salary?: number | null
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          contract_type?: string
          created_at?: string | null
          document_url?: string | null
          employee_id?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          probation_end_date?: string | null
          renewal_reminder_sent?: boolean | null
          salary?: number | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_employee_contracts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_employee_schedules: {
        Row: {
          created_at: string | null
          created_by: string | null
          effective_date: string | null
          employee_id: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          schedule_type_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          effective_date?: string | null
          employee_id?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          schedule_type_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          effective_date?: string | null
          employee_id?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          schedule_type_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_employee_schedules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_employee_schedules_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_employee_schedules_schedule_type_id_fkey"
            columns: ["schedule_type_id"]
            isOneToOne: false
            referencedRelation: "hr_work_schedule_types"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_employee_training: {
        Row: {
          certification: string | null
          completion_date: string | null
          created_at: string | null
          employee_id: string | null
          id: string
          notes: string | null
          status: string | null
          training_id: string | null
        }
        Insert: {
          certification?: string | null
          completion_date?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          training_id?: string | null
        }
        Update: {
          certification?: string | null
          completion_date?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          training_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_employee_training_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_employee_training_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "hr_training"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_evaluations: {
        Row: {
          areas_for_improvement: string | null
          created_at: string | null
          employee_id: string | null
          evaluation_date: string | null
          evaluation_period: string | null
          evaluator_id: string | null
          goals: string | null
          id: string
          overall_rating: number | null
          status: string | null
          strengths: string | null
          updated_at: string | null
        }
        Insert: {
          areas_for_improvement?: string | null
          created_at?: string | null
          employee_id?: string | null
          evaluation_date?: string | null
          evaluation_period?: string | null
          evaluator_id?: string | null
          goals?: string | null
          id?: string
          overall_rating?: number | null
          status?: string | null
          strengths?: string | null
          updated_at?: string | null
        }
        Update: {
          areas_for_improvement?: string | null
          created_at?: string | null
          employee_id?: string | null
          evaluation_date?: string | null
          evaluation_period?: string | null
          evaluator_id?: string | null
          goals?: string | null
          id?: string
          overall_rating?: number | null
          status?: string | null
          strengths?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_evaluations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_evaluations_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_leave_entitlements: {
        Row: {
          created_at: string | null
          employee_id: string
          id: string
          leave_type_id: string
          remaining_days: number | null
          total_days: number
          updated_at: string | null
          used_days: number | null
          year: number
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          id?: string
          leave_type_id: string
          remaining_days?: number | null
          total_days: number
          updated_at?: string | null
          used_days?: number | null
          year: number
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          id?: string
          leave_type_id?: string
          remaining_days?: number | null
          total_days?: number
          updated_at?: string | null
          used_days?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "hr_leave_entitlements_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_leave_entitlements_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "hr_leave_types"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_leave_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          employee_id: string | null
          end_date: string
          id: string
          leave_type: string
          reason: string | null
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          employee_id?: string | null
          end_date: string
          id?: string
          leave_type: string
          reason?: string | null
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          employee_id?: string | null
          end_date?: string
          id?: string
          leave_type?: string
          reason?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_leave_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_leave_types: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          gender_eligibility: string
          id: string
          is_active: boolean | null
          is_paid: boolean | null
          max_days_per_year: number | null
          name: string
          requires_approval: boolean | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          gender_eligibility?: string
          id?: string
          is_active?: boolean | null
          is_paid?: boolean | null
          max_days_per_year?: number | null
          name: string
          requires_approval?: boolean | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          gender_eligibility?: string
          id?: string
          is_active?: boolean | null
          is_paid?: boolean | null
          max_days_per_year?: number | null
          name?: string
          requires_approval?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_leave_types_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_training: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          start_date: string | null
          status: string | null
          title: string
          training_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string | null
          title: string
          training_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string | null
          title?: string
          training_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      hr_weekly_schedule: {
        Row: {
          break_end_time: string | null
          break_start_time: string | null
          created_at: string | null
          day_of_week: number
          id: string
          is_working_day: boolean | null
          schedule_type_id: string | null
          updated_at: string | null
          work_end_time: string | null
          work_start_time: string | null
        }
        Insert: {
          break_end_time?: string | null
          break_start_time?: string | null
          created_at?: string | null
          day_of_week: number
          id?: string
          is_working_day?: boolean | null
          schedule_type_id?: string | null
          updated_at?: string | null
          work_end_time?: string | null
          work_start_time?: string | null
        }
        Update: {
          break_end_time?: string | null
          break_start_time?: string | null
          created_at?: string | null
          day_of_week?: number
          id?: string
          is_working_day?: boolean | null
          schedule_type_id?: string | null
          updated_at?: string | null
          work_end_time?: string | null
          work_start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_weekly_schedule_schedule_type_id_fkey"
            columns: ["schedule_type_id"]
            isOneToOne: false
            referencedRelation: "hr_work_schedule_types"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_work_days: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string | null
          id: string
          is_working_day: boolean | null
          schedule_id: string
          start_time: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time?: string | null
          id?: string
          is_working_day?: boolean | null
          schedule_id: string
          start_time?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string | null
          id?: string
          is_working_day?: boolean | null
          schedule_id?: string
          start_time?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_work_days_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "hr_work_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_work_schedule_types: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_work_schedule_types_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_work_schedules: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          updated_at: string | null
          work_days_per_week: number
          work_hours_per_day: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string | null
          work_days_per_week: number
          work_hours_per_day: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string | null
          work_days_per_week?: number
          work_hours_per_day?: number
        }
        Relationships: []
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
          display_name: string | null
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
          display_name?: string | null
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
          display_name?: string | null
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
          {
            foreignKeyName: "idea_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
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
            foreignKeyName: "idea_decisions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "idea_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "idea_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
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
          {
            foreignKeyName: "ideas_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ideas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      in_app_notifications: {
        Row: {
          additional_data: string | null
          created_at: string
          id: string
          message: string
          notification_type: string
          priority: string | null
          read: boolean
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          user_id: string
        }
        Insert: {
          additional_data?: string | null
          created_at?: string
          id?: string
          message: string
          notification_type: string
          priority?: string | null
          read?: boolean
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          user_id: string
        }
        Update: {
          additional_data?: string | null
          created_at?: string
          id?: string
          message?: string
          notification_type?: string
          priority?: string | null
          read?: boolean
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "in_app_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_message_attachments: {
        Row: {
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          message_id: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          message_id: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          message_id?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internal_message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "internal_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_message_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_message_label_relations: {
        Row: {
          created_at: string
          id: string
          label_id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label_id: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label_id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_message_label_relations_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "internal_message_labels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_message_label_relations_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "internal_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_message_label_relations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_message_labels: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_message_labels_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_message_recipients: {
        Row: {
          created_at: string
          id: string
          is_deleted: boolean
          message_id: string
          read_at: string | null
          read_status: string
          recipient_id: string
          recipient_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_deleted?: boolean
          message_id: string
          read_at?: string | null
          read_status?: string
          recipient_id: string
          recipient_type?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_deleted?: boolean
          message_id?: string
          read_at?: string | null
          read_status?: string
          recipient_id?: string
          recipient_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_message_recipients_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "internal_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_message_recipients_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_messages: {
        Row: {
          content: string | null
          created_at: string
          folder: string
          has_attachments: boolean
          id: string
          is_draft: boolean
          is_starred: boolean
          parent_id: string | null
          sender_id: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          folder?: string
          has_attachments?: boolean
          id?: string
          is_draft?: boolean
          is_starred?: boolean
          parent_id?: string | null
          sender_id: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          folder?: string
          has_attachments?: boolean
          id?: string
          is_draft?: boolean
          is_starred?: boolean
          parent_id?: string | null
          sender_id?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_messages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "internal_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      letter_templates: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          default_formatting: Json | null
          id: string
          is_active: boolean | null
          template_type: string
          title: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          default_formatting?: Json | null
          id?: string
          is_active?: boolean | null
          template_type: string
          title: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          default_formatting?: Json | null
          id?: string
          is_active?: boolean | null
          template_type?: string
          title?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "letter_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_agenda_items: {
        Row: {
          content: string
          created_at: string | null
          id: string
          meeting_id: string
          order_number: number
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          meeting_id: string
          order_number: number
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          meeting_id?: string
          order_number?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_agenda_items_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_folder_members: {
        Row: {
          created_at: string | null
          folder_id: string
          id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          folder_id: string
          id?: string
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          folder_id?: string
          id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_folder_members_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "meeting_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_folder_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_folders: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_folders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_minutes: {
        Row: {
          agenda_notes: Json | null
          attendees: string[] | null
          author_id: string | null
          author_name: string | null
          conclusion: string | null
          content: string | null
          created_at: string
          created_by: string | null
          id: string
          introduction: string | null
          meeting_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          agenda_notes?: Json | null
          attendees?: string[] | null
          author_id?: string | null
          author_name?: string | null
          conclusion?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          introduction?: string | null
          meeting_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          agenda_notes?: Json | null
          attendees?: string[] | null
          author_id?: string | null
          author_name?: string | null
          conclusion?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          introduction?: string | null
          meeting_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_minutes_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_minutes_items: {
        Row: {
          agenda_item_id: string | null
          content: string | null
          created_at: string
          created_by: string | null
          id: string
          meeting_id: string
          order_number: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          agenda_item_id?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          meeting_id: string
          order_number: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          agenda_item_id?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          meeting_id?: string
          order_number?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_minutes_items_agenda_item_id_fkey"
            columns: ["agenda_item_id"]
            isOneToOne: false
            referencedRelation: "meeting_agenda_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_minutes_items_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_objectives: {
        Row: {
          content: string
          created_at: string | null
          id: string
          meeting_id: string
          order_number: number
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          meeting_id: string
          order_number: number
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          meeting_id?: string
          order_number?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_objectives_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_participants: {
        Row: {
          attendance_status: string | null
          created_at: string | null
          id: string
          meeting_id: string
          phone: string | null
          role: string | null
          title: string | null
          updated_at: string | null
          user_display_name: string | null
          user_email: string | null
          user_id: string
        }
        Insert: {
          attendance_status?: string | null
          created_at?: string | null
          id?: string
          meeting_id: string
          phone?: string | null
          role?: string | null
          title?: string | null
          updated_at?: string | null
          user_display_name?: string | null
          user_email?: string | null
          user_id: string
        }
        Update: {
          attendance_status?: string | null
          created_at?: string | null
          id?: string
          meeting_id?: string
          phone?: string | null
          role?: string | null
          title?: string | null
          updated_at?: string | null
          user_display_name?: string | null
          user_email?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_participants_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          meeting_id: string
          status: string
          task_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          meeting_id: string
          status?: string
          task_type?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          meeting_id?: string
          status?: string
          task_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_tasks_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_users: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          attendance_type: string
          created_at: string
          created_by: string
          date: string
          duration: number
          folder_id: string | null
          id: string
          location: string | null
          meeting_link: string | null
          meeting_status: string
          meeting_type: string
          objectives: string | null
          start_time: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          attendance_type: string
          created_at?: string
          created_by: string
          date: string
          duration: number
          folder_id?: string | null
          id?: string
          location?: string | null
          meeting_link?: string | null
          meeting_status?: string
          meeting_type: string
          objectives?: string | null
          start_time: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          attendance_type?: string
          created_at?: string
          created_by?: string
          date?: string
          duration?: number
          folder_id?: string | null
          id?: string
          location?: string | null
          meeting_link?: string | null
          meeting_status?: string
          meeting_type?: string
          objectives?: string | null
          start_time?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "meeting_folders"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      obligation_expenses: {
        Row: {
          amount: number
          beneficiary: string | null
          created_at: string | null
          created_by: string | null
          date: string
          description: string
          id: string
          obligation_id: string
          reference_document: string | null
        }
        Insert: {
          amount: number
          beneficiary?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          description: string
          id?: string
          obligation_id: string
          reference_document?: string | null
        }
        Update: {
          amount?: number
          beneficiary?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string
          id?: string
          obligation_id?: string
          reference_document?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "obligation_expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obligation_expenses_obligation_id_fkey"
            columns: ["obligation_id"]
            isOneToOne: false
            referencedRelation: "obligation_balances_view"
            referencedColumns: ["obligation_id"]
          },
          {
            foreignKeyName: "obligation_expenses_obligation_id_fkey"
            columns: ["obligation_id"]
            isOneToOne: false
            referencedRelation: "resource_obligations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obligation_expenses_obligation_id_fkey"
            columns: ["obligation_id"]
            isOneToOne: false
            referencedRelation: "resource_obligations_view"
            referencedColumns: ["id"]
          },
        ]
      }
      organizational_units: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          position_type: string | null
          unit_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          position_type?: string | null
          unit_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          position_type?: string | null
          unit_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizational_units_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizational_units_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "organizational_units"
            referencedColumns: ["id"]
          },
        ]
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
          category: string | null
          created_at: string
          description: string | null
          display_name: string | null
          id: string
          module: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_name?: string | null
          id?: string
          module: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_name?: string | null
          id?: string
          module?: string
          name?: string
        }
        Relationships: []
      }
      permissions_backup: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          display_name: string | null
          id: string | null
          module: string | null
          name: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          id?: string | null
          module?: string | null
          name?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          id?: string | null
          module?: string | null
          name?: string | null
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
            foreignKeyName: "portfolio_subtasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "portfolio_task_attachments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "portfolio_task_comments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
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
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          parent_task_id: string | null
          priority: string | null
          project_id: string | null
          status: string | null
          title: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          parent_task_id?: string | null
          priority?: string | null
          project_id?: string | null
          status?: string | null
          title: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          parent_task_id?: string | null
          priority?: string | null
          project_id?: string | null
          status?: string | null
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
      portfolios: {
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
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "project_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "project_tasks_project_manager_fkey"
            columns: ["project_manager"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
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
            foreignKeyName: "recurring_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
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
          {
            foreignKeyName: "registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      request_approval_logs: {
        Row: {
          action_type: string
          comments: string | null
          created_at: string
          error_message: string | null
          execution_time_ms: number | null
          id: string
          metadata: Json | null
          request_id: string
          status: string | null
          step_id: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          comments?: string | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          metadata?: Json | null
          request_id: string
          status?: string | null
          step_id?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          comments?: string | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          metadata?: Json | null
          request_id?: string
          status?: string | null
          step_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_approval_logs_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_approval_logs_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_approval_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
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
            foreignKeyName: "request_approvals_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
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
      request_approvals_backup: {
        Row: {
          approved_at: string | null
          approver_id: string | null
          comments: string | null
          created_at: string | null
          id: string | null
          request_id: string | null
          status: string | null
          step_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approver_id?: string | null
          comments?: string | null
          created_at?: string | null
          id?: string | null
          request_id?: string | null
          status?: string | null
          step_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approver_id?: string | null
          comments?: string | null
          created_at?: string | null
          id?: string | null
          request_id?: string | null
          status?: string | null
          step_id?: string | null
        }
        Relationships: []
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
          {
            foreignKeyName: "request_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      request_deletion_logs: {
        Row: {
          deleted_at: string
          deleted_by: string
          id: string
          request_data: Json
          request_id: string
        }
        Insert: {
          deleted_at?: string
          deleted_by: string
          id?: string
          request_data: Json
          request_id: string
        }
        Update: {
          deleted_at?: string
          deleted_by?: string
          id?: string
          request_data?: Json
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_deletion_logs_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      request_export_logs: {
        Row: {
          error_message: string | null
          export_type: string
          exported_at: string
          exported_by: string | null
          id: string
          request_id: string | null
          status: string | null
        }
        Insert: {
          error_message?: string | null
          export_type: string
          exported_at?: string
          exported_by?: string | null
          id?: string
          request_id?: string | null
          status?: string | null
        }
        Update: {
          error_message?: string | null
          export_type?: string
          exported_at?: string
          exported_by?: string | null
          id?: string
          request_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_export_logs_exported_by_fkey"
            columns: ["exported_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_export_logs_request_id_fkey"
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
        Relationships: [
          {
            foreignKeyName: "request_types_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      request_workflow_operation_logs: {
        Row: {
          created_at: string
          details: string | null
          error_message: string | null
          id: string
          operation_type: string
          request_data: Json | null
          request_type_id: string | null
          response_data: Json | null
          step_id: string | null
          user_id: string | null
          workflow_id: string | null
        }
        Insert: {
          created_at?: string
          details?: string | null
          error_message?: string | null
          id?: string
          operation_type: string
          request_data?: Json | null
          request_type_id?: string | null
          response_data?: Json | null
          step_id?: string | null
          user_id?: string | null
          workflow_id?: string | null
        }
        Update: {
          created_at?: string
          details?: string | null
          error_message?: string | null
          id?: string
          operation_type?: string
          request_data?: Json | null
          request_type_id?: string | null
          response_data?: Json | null
          step_id?: string | null
          user_id?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_operation_logs_request_type_id_fkey"
            columns: ["request_type_id"]
            isOneToOne: false
            referencedRelation: "request_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_operation_logs_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "request_workflow_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_operation_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_operation_logs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "request_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      request_workflow_steps: {
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
            foreignKeyName: "request_workflows_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "fk_requests_requester"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
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
      role_permissions_backup: {
        Row: {
          created_at: string | null
          id: string | null
          permission_id: string | null
          role_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          permission_id?: string | null
          role_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          permission_id?: string | null
          role_id?: string | null
        }
        Relationships: []
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
      saved_searches: {
        Row: {
          created_at: string
          criteria: Json
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          criteria: Json
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          criteria?: Json
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_searches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "subscription_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
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
        Relationships: [
          {
            foreignKeyName: "subscriptions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "task_attachments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "task_comments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "task_subtasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
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
          meeting_id: string | null
          priority: string | null
          project_id: string | null
          requires_deliverable: boolean | null
          stage_id: string | null
          status: string | null
          task_type: string | null
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
          meeting_id?: string | null
          priority?: string | null
          project_id?: string | null
          requires_deliverable?: boolean | null
          stage_id?: string | null
          status?: string | null
          task_type?: string | null
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
          meeting_id?: string | null
          priority?: string | null
          project_id?: string | null
          requires_deliverable?: boolean | null
          stage_id?: string | null
          status?: string | null
          task_type?: string | null
          title?: string
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "unified_task_comments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "user_notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          cache_preferences: Json | null
          created_at: string | null
          developer_mode: boolean | null
          id: string
          language: string | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cache_preferences?: Json | null
          created_at?: string | null
          developer_mode?: boolean | null
          id?: string
          language?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cache_preferences?: Json | null
          created_at?: string | null
          developer_mode?: boolean | null
          id?: string
          language?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "auth_users_view"
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
      workflow_step_migration_logs: {
        Row: {
          id: string
          migrated_at: string | null
          new_step_id: string | null
          old_step_id: string | null
          step_name: string | null
          workflow_id: string | null
        }
        Insert: {
          id?: string
          migrated_at?: string | null
          new_step_id?: string | null
          old_step_id?: string | null
          step_name?: string | null
          workflow_id?: string | null
        }
        Update: {
          id?: string
          migrated_at?: string | null
          new_step_id?: string | null
          old_step_id?: string | null
          step_name?: string | null
          workflow_id?: string | null
        }
        Relationships: []
      }
      workflow_steps: {
        Row: {
          approver_id: string | null
          approver_type: string | null
          created_at: string | null
          id: string
          instructions: string | null
          is_required: boolean | null
          step_name: string
          step_order: number
          step_type: string
          workflow_id: string
        }
        Insert: {
          approver_id?: string | null
          approver_type?: string | null
          created_at?: string | null
          id?: string
          instructions?: string | null
          is_required?: boolean | null
          step_name: string
          step_order: number
          step_type?: string
          workflow_id: string
        }
        Update: {
          approver_id?: string | null
          approver_type?: string | null
          created_at?: string | null
          id?: string
          instructions?: string | null
          is_required?: boolean | null
          step_name?: string
          step_order?: number
          step_type?: string
          workflow_id?: string
        }
        Relationships: []
      }
      workflow_steps_backup: {
        Row: {
          approver_id: string | null
          approver_type: string | null
          created_at: string | null
          id: string | null
          instructions: string | null
          is_required: boolean | null
          step_name: string | null
          step_order: number | null
          step_type: string | null
          workflow_id: string | null
        }
        Insert: {
          approver_id?: string | null
          approver_type?: string | null
          created_at?: string | null
          id?: string | null
          instructions?: string | null
          is_required?: boolean | null
          step_name?: string | null
          step_order?: number | null
          step_type?: string | null
          workflow_id?: string | null
        }
        Update: {
          approver_id?: string | null
          approver_type?: string | null
          created_at?: string | null
          id?: string | null
          instructions?: string | null
          is_required?: boolean | null
          step_name?: string | null
          step_order?: number | null
          step_type?: string | null
          workflow_id?: string | null
        }
        Relationships: []
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
      auth_users_view: {
        Row: {
          email: string | null
          id: string | null
          raw_user_meta_data: Json | null
        }
        Insert: {
          email?: string | null
          id?: string | null
          raw_user_meta_data?: Json | null
        }
        Update: {
          email?: string | null
          id?: string | null
          raw_user_meta_data?: Json | null
        }
        Relationships: []
      }
      obligation_balances_view: {
        Row: {
          description: string | null
          obligation_id: string | null
          original_amount: number | null
          remaining_balance: number | null
          resource_date: string | null
          resource_id: string | null
          resource_source: string | null
          spending_percentage: number | null
          spent_amount: number | null
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
      request_workflow_operations_view: {
        Row: {
          created_at: string | null
          details: string | null
          error_message: string | null
          id: string | null
          operation_type: string | null
          request_data: Json | null
          request_type_id: string | null
          request_type_name: string | null
          response_data: Json | null
          step_id: string | null
          step_name: string | null
          user_email: string | null
          user_name: string | null
          workflow_id: string | null
          workflow_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_operation_logs_request_type_id_fkey"
            columns: ["request_type_id"]
            isOneToOne: false
            referencedRelation: "request_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_operation_logs_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "request_workflow_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_operation_logs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "request_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_obligations_view: {
        Row: {
          amount: number | null
          created_at: string | null
          description: string | null
          id: string | null
          resource_date: string | null
          resource_id: string | null
          resource_net_amount: number | null
          resource_source: string | null
          resource_total_amount: number | null
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
      vw_request_approval_logs: {
        Row: {
          action_type: string | null
          comments: string | null
          created_at: string | null
          error_message: string | null
          execution_time_ms: number | null
          id: string | null
          metadata: Json | null
          request_id: string | null
          request_title: string | null
          request_type_name: string | null
          status: string | null
          step_id: string | null
          step_name: string | null
          user_display_name: string | null
          user_email: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_approval_logs_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_approval_logs_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_approval_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      anonymize_user_data: {
        Args: { user_id: string }
        Returns: undefined
      }
      approve_request: {
        Args:
          | { p_request_id: string; p_step_id: string; p_comments?: string }
          | {
              p_request_id: string
              p_step_id: string
              p_comments?: string
              p_metadata?: Json
            }
        Returns: Json
      }
      assign_user_role: {
        Args: { p_user_id: string; p_role_id: string }
        Returns: boolean
      }
      calculate_leave_balance: {
        Args: {
          p_employee_id: string
          p_leave_type_id: string
          p_year?: number
        }
        Returns: Json
      }
      can_delete_request: {
        Args: { p_request_id: string }
        Returns: boolean
      }
      check_admin_role: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_attendance_status: {
        Args: { check_in_time: string; schedule_start_time: string }
        Returns: Record<string, unknown>
      }
      check_if_request_accessible: {
        Args: { request_id: string }
        Returns: boolean
      }
      check_if_user_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_if_user_is_request_approver: {
        Args: { request_id: string }
        Returns: boolean
      }
      check_if_user_is_step_approver: {
        Args: { step_id: string }
        Returns: boolean
      }
      check_table_exists: {
        Args: { table_name: string }
        Returns: {
          table_exists: boolean
        }[]
      }
      check_user_permission: {
        Args: {
          p_user_id: string
          p_app_name: string
          p_permission_name: string
        }
        Returns: boolean
      }
      count_meetings_by_folder: {
        Args: Record<PropertyKey, never>
        Returns: {
          folder_id: string
          count: number
        }[]
      }
      debug_request_workflow: {
        Args: { request_id: string }
        Returns: Json
      }
      delete_draft_project: {
        Args: { p_project_id: string; p_user_id: string }
        Returns: boolean
      }
      delete_project: {
        Args: { p_project_id: string; p_user_id: string }
        Returns: boolean
      }
      delete_request: {
        Args: { p_request_id: string }
        Returns: Json
      }
      delete_request_type: {
        Args: { p_request_type_id: string }
        Returns: Json
      }
      delete_task: {
        Args: { p_task_id: string; p_user_id: string }
        Returns: boolean
      }
      delete_user_roles: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      delete_workspace: {
        Args: { p_workspace_id: string; p_user_id: string }
        Returns: boolean
      }
      diagnose_workflow_issues: {
        Args: { p_request_id: string }
        Returns: Json
      }
      fix_orphaned_request_types: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      fix_request_status: {
        Args: { p_request_id: string }
        Returns: Json
      }
      generate_correspondence_number: {
        Args: { p_type: string }
        Returns: string
      }
      generate_next_registration_number: {
        Args: { event_id: string } | { p_type: string; p_id: string }
        Returns: string
      }
      generate_recurring_tasks: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_all_requests_admin: {
        Args: Record<PropertyKey, never>
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
      get_all_requests_with_relations: {
        Args: Record<PropertyKey, never>
        Returns: Json[]
      }
      get_app_keys_for_module: {
        Args: { module_name: string }
        Returns: string[]
      }
      get_app_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
        }[]
      }
      get_organizational_hierarchy: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          description: string
          unit_type: string
          parent_id: string
          level: number
          path: string[]
          position_type: string
        }[]
      }
      get_organizational_unit_children: {
        Args: { unit_id: string }
        Returns: {
          id: string
          name: string
          description: string
          unit_type: string
          parent_id: string
          level: number
        }[]
      }
      get_request_details: {
        Args: { p_request_id: string }
        Returns: Json
      }
      get_request_pdf_export_data: {
        Args: { p_request_id: string }
        Returns: Json
      }
      get_request_statistics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_server_timestamp: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_tasks_with_details: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          title: string
          description: string
          status: string
          due_date: string
          assigned_to: string
          assigned_user_name: string
          priority: string
          created_at: string
          created_by: string
          stage_id: string
          stage_name: string
          category: string
          is_general: boolean
          meeting_id: string
          task_type: string
          project_id: string
          workspace_id: string
          requires_deliverable: boolean
        }[]
      }
      get_user_incoming_requests: {
        Args: { p_user_id: string }
        Returns: Json[]
      }
      get_user_messages: {
        Args: { p_user_id: string; p_folder?: string }
        Returns: {
          id: string
          subject: string
          content: string
          sender_id: string
          sender_name: string
          created_at: string
          status: string
          is_read: boolean
          has_attachments: boolean
          is_starred: boolean
          recipients: Json
        }[]
      }
      get_user_opinion_requests: {
        Args: { p_user_id: string }
        Returns: Json[]
      }
      get_user_outgoing_requests: {
        Args: { p_user_id: string }
        Returns: Json[]
      }
      get_user_permissions: {
        Args: { p_user_id: string }
        Returns: {
          app: string
          permission: string
        }[]
      }
      get_user_role: {
        Args: { p_user_id: string }
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
      has_developer_role: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      has_hr_access: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      insert_request_bypass_rls: {
        Args: { request_data: Json }
        Returns: Json
      }
      insert_workflow_steps: {
        Args: { steps: Json[] }
        Returns: Json
      }
      is_admin: {
        Args: Record<PropertyKey, never> | { user_id: string }
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never> | { user_id: string }
        Returns: boolean
      }
      is_approver_for_current_request: {
        Args: { request_id: string }
        Returns: boolean
      }
      is_approver_for_request: {
        Args: { request_id: string }
        Returns: boolean
      }
      is_approver_for_step: {
        Args: { step_id: string }
        Returns: boolean
      }
      is_developer: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_message_recipient: {
        Args: { message_id: string; user_id: string }
        Returns: boolean
      }
      is_message_sender: {
        Args: { message_id: string; user_id: string }
        Returns: boolean
      }
      is_request_accessible: {
        Args: { request_id: string }
        Returns: boolean
      }
      is_request_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_request_approver: {
        Args: { step_id: string } | { step_id: string; user_id: string }
        Returns: boolean
      }
      is_request_creator: {
        Args: { request_id: string }
        Returns: boolean
      }
      is_request_requester: {
        Args: { request_id: string }
        Returns: boolean
      }
      is_step_approver: {
        Args: { step_id: string }
        Returns: boolean
      }
      log_request_approval_action: {
        Args: {
          p_request_id: string
          p_step_id: string
          p_action_type: string
          p_status?: string
          p_comments?: string
          p_metadata?: Json
          p_execution_time_ms?: number
          p_error_message?: string
        }
        Returns: string
      }
      log_request_view: {
        Args: { p_request_id: string; p_metadata?: Json }
        Returns: string
      }
      log_user_activity: {
        Args: { user_id: string; activity_type: string; details: string }
        Returns: string
      }
      log_workflow_operation: {
        Args: {
          p_operation_type: string
          p_request_type_id?: string
          p_workflow_id?: string
          p_step_id?: string
          p_request_data?: Json
          p_response_data?: Json
          p_error_message?: string
          p_details?: string
        }
        Returns: string
      }
      mark_absent_employees: {
        Args: { p_date?: string; p_default_schedule_id?: string }
        Returns: Json
      }
      record_employee_attendance: {
        Args: { p_action: string; p_employee_id?: string }
        Returns: Json
      }
      record_request_pdf_export: {
        Args: { p_request_id: string; p_exported_by: string }
        Returns: string
      }
      reject_request: {
        Args:
          | { p_request_id: string; p_step_id: string; p_comments: string }
          | {
              p_request_id: string
              p_step_id: string
              p_comments: string
              p_metadata?: Json
            }
        Returns: Json
      }
      set_default_workflow: {
        Args: { p_request_type_id: string; p_workflow_id: string }
        Returns: boolean
      }
      soft_delete_user: {
        Args: { user_id: string }
        Returns: boolean
      }
      sync_role_app_permissions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      test_auth_uid: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      update_request_after_approval: {
        Args: { p_request_id: string; p_step_id: string }
        Returns: Json
      }
      update_request_after_rejection: {
        Args: { p_request_id: string; p_step_id: string }
        Returns: Json
      }
      update_workspace_members_count: {
        Args: { workspace_id: string }
        Returns: undefined
      }
      upsert_request_type: {
        Args: { request_type_data: Json; is_update?: boolean }
        Returns: Json
      }
      upsert_workflow: {
        Args: { workflow_data: Json; is_update?: boolean }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
