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
      get_setting: {
        Args: { p_key: string }
        Returns: number
      }
      upsert_offer_line_item: {
        Args: {
          p_hnlineid: number
          p_project_id: string
          p_description: string
          p_units: number
          p_unitname: string
          p_salespricestandardcurrency: number
          p_totalpricestandardcurrency: number
          p_hnbudgetlineid: number
        }
        Returns: undefined
      }
      upsert_project: {
        Args: {
          p_id: string
          p_name: string
          p_responsible_person_initials: string
          p_offer_amount: number
          p_assembly_amount: number
          p_subcontractor_amount: number
          p_hours_used_projecting: number
          p_hours_used_production: number
          p_hours_used_assembly: number
          p_materials_amount: number
          p_hours_estimated_projecting: number
          p_hours_estimated_production: number
          p_hours_estimated_assembly: number
          p_hours_used_total: number
          p_hours_remaining_projecting: number
          p_hours_remaining_production: number
          p_hours_remaining_assembly: number
          p_allocated_freight_amount: number
          p_last_api_update: string
        }
        Returns: undefined
      }
      upsert_project_from_n8n: {
        Args: {
          p_id: string
          p_name: string
          p_responsible_person_initials: string
          p_offer_amount: number
          p_assembly_amount: number
          p_subcontractor_amount: number
          p_hours_used_projecting: number
          p_hours_used_production: number
          p_hours_used_assembly: number
          p_last_api_update: string
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
