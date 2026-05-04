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
      allowed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      appointment_categories: {
        Row: {
          hn_appointment_category_id: number
          name: string
          synced_at: string | null
        }
        Insert: {
          hn_appointment_category_id: number
          name: string
          synced_at?: string | null
        }
        Update: {
          hn_appointment_category_id?: number
          name?: string
          synced_at?: string | null
        }
        Relationships: []
      }
      appointment_worktypes: {
        Row: {
          api_internal: boolean
          hidden: boolean
          hn_work_type_id: number
          name: string
          synced_at: string | null
        }
        Insert: {
          api_internal?: boolean
          hidden?: boolean
          hn_work_type_id: number
          name: string
          synced_at?: string | null
        }
        Update: {
          api_internal?: boolean
          hidden?: boolean
          hn_work_type_id?: number
          name?: string
          synced_at?: string | null
        }
        Relationships: []
      }
      daily_time_registrations: {
        Row: {
          appointment_project: string | null
          appointment_subject: string | null
          category: string
          date: string
          description: string | null
          duration: number
          hn_appointment_category_id: number | null
          hn_appointment_id: number | null
          hn_user_id: number
          hn_work_type_id: number | null
          id: string
          synced_at: string | null
        }
        Insert: {
          appointment_project?: string | null
          appointment_subject?: string | null
          category: string
          date: string
          description?: string | null
          duration: number
          hn_appointment_category_id?: number | null
          hn_appointment_id?: number | null
          hn_user_id: number
          hn_work_type_id?: number | null
          id?: string
          synced_at?: string | null
        }
        Update: {
          appointment_project?: string | null
          appointment_subject?: string | null
          category?: string
          date?: string
          description?: string | null
          duration?: number
          hn_appointment_category_id?: number | null
          hn_appointment_id?: number | null
          hn_user_id?: number
          hn_work_type_id?: number | null
          id?: string
          synced_at?: string | null
        }
        Relationships: []
      }
      employee_work_schedules: {
        Row: {
          created_at: string | null
          employee_name: string
          friday: number | null
          hn_user_id: number
          id: string
          is_custom: boolean | null
          monday: number | null
          saturday: number | null
          sunday: number | null
          thursday: number | null
          tuesday: number | null
          updated_at: string | null
          wednesday: number | null
        }
        Insert: {
          created_at?: string | null
          employee_name: string
          friday?: number | null
          hn_user_id: number
          id?: string
          is_custom?: boolean | null
          monday?: number | null
          saturday?: number | null
          sunday?: number | null
          thursday?: number | null
          tuesday?: number | null
          updated_at?: string | null
          wednesday?: number | null
        }
        Update: {
          created_at?: string | null
          employee_name?: string
          friday?: number | null
          hn_user_id?: number
          id?: string
          is_custom?: boolean | null
          monday?: number | null
          saturday?: number | null
          sunday?: number | null
          thursday?: number | null
          tuesday?: number | null
          updated_at?: string | null
          wednesday?: number | null
        }
        Relationships: []
      }
      hidden_employees: {
        Row: {
          filter: string
          hidden_at: string | null
          hn_user_id: number
          id: string
        }
        Insert: {
          filter: string
          hidden_at?: string | null
          hn_user_id: number
          id?: string
        }
        Update: {
          filter?: string
          hidden_at?: string | null
          hn_user_id?: number
          id?: string
        }
        Relationships: []
      }
      offer_line_items: {
        Row: {
          description: string | null
          hnBudgetLineID: number | null
          hnLineID: number
          project_id: string | null
          salesPriceStandardCurrency: number | null
          totalPriceStandardCurrency: number | null
          unitName: string | null
          units: number | null
        }
        Insert: {
          description?: string | null
          hnBudgetLineID?: number | null
          hnLineID: number
          project_id?: string | null
          salesPriceStandardCurrency?: number | null
          totalPriceStandardCurrency?: number | null
          unitName?: string | null
          units?: number | null
        }
        Update: {
          description?: string | null
          hnBudgetLineID?: number | null
          hnLineID?: number
          project_id?: string | null
          salesPriceStandardCurrency?: number | null
          totalPriceStandardCurrency?: number | null
          unitName?: string | null
          units?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "offer_line_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          allocated_freight_amount: number | null
          assembly_amount: number | null
          completion_percentage_manual: number | null
          completion_percentage_previous: number | null
          hn_appointment_category_id: number | null
          hours_estimated_assembly: number | null
          hours_estimated_by_completion: number | null
          hours_estimated_production: number | null
          hours_estimated_projecting: number | null
          hours_remaining_assembly: number | null
          hours_remaining_production: number | null
          hours_remaining_projecting: number | null
          hours_used_assembly: number | null
          hours_used_production: number | null
          hours_used_projecting: number | null
          hours_used_total: number | null
          id: string
          last_api_update: string | null
          last_calculation_update: string | null
          manual_assembly_amount: number | null
          manual_subcontractor_amount: number | null
          materials_amount: number | null
          name: string | null
          offer_amount: number | null
          plus_minus_hours: number | null
          responsible_person_initials: string | null
          subcontractor_amount: number | null
        }
        Insert: {
          allocated_freight_amount?: number | null
          assembly_amount?: number | null
          completion_percentage_manual?: number | null
          completion_percentage_previous?: number | null
          hn_appointment_category_id?: number | null
          hours_estimated_assembly?: number | null
          hours_estimated_by_completion?: number | null
          hours_estimated_production?: number | null
          hours_estimated_projecting?: number | null
          hours_remaining_assembly?: number | null
          hours_remaining_production?: number | null
          hours_remaining_projecting?: number | null
          hours_used_assembly?: number | null
          hours_used_production?: number | null
          hours_used_projecting?: number | null
          hours_used_total?: number | null
          id: string
          last_api_update?: string | null
          last_calculation_update?: string | null
          manual_assembly_amount?: number | null
          manual_subcontractor_amount?: number | null
          materials_amount?: number | null
          name?: string | null
          offer_amount?: number | null
          plus_minus_hours?: number | null
          responsible_person_initials?: string | null
          subcontractor_amount?: number | null
        }
        Update: {
          allocated_freight_amount?: number | null
          assembly_amount?: number | null
          completion_percentage_manual?: number | null
          completion_percentage_previous?: number | null
          hn_appointment_category_id?: number | null
          hours_estimated_assembly?: number | null
          hours_estimated_by_completion?: number | null
          hours_estimated_production?: number | null
          hours_estimated_projecting?: number | null
          hours_remaining_assembly?: number | null
          hours_remaining_production?: number | null
          hours_remaining_projecting?: number | null
          hours_used_assembly?: number | null
          hours_used_production?: number | null
          hours_used_projecting?: number | null
          hours_used_total?: number | null
          id?: string
          last_api_update?: string | null
          last_calculation_update?: string | null
          manual_assembly_amount?: number | null
          manual_subcontractor_amount?: number | null
          materials_amount?: number | null
          name?: string | null
          offer_amount?: number | null
          plus_minus_hours?: number | null
          responsible_person_initials?: string | null
          subcontractor_amount?: number | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          description: string | null
          key: string
          value: number | null
        }
        Insert: {
          description?: string | null
          key: string
          value?: number | null
        }
        Update: {
          description?: string | null
          key?: string
          value?: number | null
        }
        Relationships: []
      }
      sms_automation_employees: {
        Row: {
          accounts: string[] | null
          added_at: string | null
          employee_name: string
          hn_user_id: number
          is_active: boolean | null
          phone_number: string
        }
        Insert: {
          accounts?: string[] | null
          added_at?: string | null
          employee_name: string
          hn_user_id: number
          is_active?: boolean | null
          phone_number: string
        }
        Update: {
          accounts?: string[] | null
          added_at?: string | null
          employee_name?: string
          hn_user_id?: number
          is_active?: boolean | null
          phone_number?: string
        }
        Relationships: []
      }
      sms_reminder_cases: {
        Row: {
          created_at: string | null
          hn_user_id: number
          hours_expected: number
          hours_registered_at_resolution: number | null
          id: string
          missing_date: string
          resolved_after_reminder: string | null
          resolved_at: string | null
          status: string
          week_number: number
        }
        Insert: {
          created_at?: string | null
          hn_user_id: number
          hours_expected: number
          hours_registered_at_resolution?: number | null
          id?: string
          missing_date: string
          resolved_after_reminder?: string | null
          resolved_at?: string | null
          status?: string
          week_number: number
        }
        Update: {
          created_at?: string | null
          hn_user_id?: number
          hours_expected?: number
          hours_registered_at_resolution?: number | null
          id?: string
          missing_date?: string
          resolved_after_reminder?: string | null
          resolved_at?: string | null
          status?: string
          week_number?: number
        }
        Relationships: []
      }
      sms_reminder_logs: {
        Row: {
          case_id: string
          id: string
          phone_number: string
          reminder_type: string
          sent_at: string | null
          sms_status: string | null
        }
        Insert: {
          case_id: string
          id?: string
          phone_number: string
          reminder_type: string
          sent_at?: string | null
          sms_status?: string | null
        }
        Update: {
          case_id?: string
          id?: string
          phone_number?: string
          reminder_type?: string
          sent_at?: string | null
          sms_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_reminder_logs_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "sms_reminder_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      time_utilization_employees: {
        Row: {
          added_at: string | null
          employee_name: string
          hn_user_id: number
        }
        Insert: {
          added_at?: string | null
          employee_name: string
          hn_user_id: number
        }
        Update: {
          added_at?: string | null
          employee_name?: string
          hn_user_id?: number
        }
        Relationships: []
      }
      time_utilization_settings: {
        Row: {
          id: string
          intern_appointment_category_ids: number[]
          intern_work_type_ids: number[]
          target_utilization: number
          updated_at: string | null
        }
        Insert: {
          id?: string
          intern_appointment_category_ids?: number[]
          intern_work_type_ids?: number[]
          target_utilization?: number
          updated_at?: string | null
        }
        Update: {
          id?: string
          intern_appointment_category_ids?: number[]
          intern_work_type_ids?: number[]
          target_utilization?: number
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_completion_metrics: {
        Args: { project_id: string }
        Returns: undefined
      }
      calculate_project_metrics: {
        Args: { project_id: string }
        Returns: undefined
      }
      get_setting: { Args: { p_key: string }; Returns: number }
      is_email_allowed: { Args: { p_email: string }; Returns: boolean }
      upsert_offer_line_item: {
        Args: {
          p_description: string
          p_hnbudgetlineid: number
          p_hnlineid: number
          p_project_id: string
          p_salespricestandardcurrency: number
          p_totalpricestandardcurrency: number
          p_unitname: string
          p_units: number
        }
        Returns: undefined
      }
      upsert_project: {
        Args: {
          p_allocated_freight_amount: number
          p_assembly_amount: number
          p_hours_estimated_assembly: number
          p_hours_estimated_production: number
          p_hours_estimated_projecting: number
          p_hours_remaining_assembly: number
          p_hours_remaining_production: number
          p_hours_remaining_projecting: number
          p_hours_used_assembly: number
          p_hours_used_production: number
          p_hours_used_projecting: number
          p_hours_used_total: number
          p_id: string
          p_last_api_update: string
          p_materials_amount: number
          p_name: string
          p_offer_amount: number
          p_responsible_person_initials: string
          p_subcontractor_amount: number
        }
        Returns: undefined
      }
      upsert_project_from_n8n: {
        Args: {
          p_assembly_amount: number
          p_hours_used_assembly: number
          p_hours_used_production: number
          p_hours_used_projecting: number
          p_id: string
          p_last_api_update: string
          p_name: string
          p_offer_amount: number
          p_responsible_person_initials: string
          p_subcontractor_amount: number
        }
        Returns: undefined
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
  public: {
    Enums: {},
  },
} as const
