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
      fokusark_appointments: {
        Row: {
          afsat_fragt: number | null
          appointment_number: string
          created_at: string
          est_timer_ift_faerdig_pct: number | null
          faerdig_pct_ex_montage_foer: number | null
          faerdig_pct_ex_montage_nu: number | null
          hn_appointment_id: number | null
          id: string
          is_sub_appointment: boolean | null
          materialer: number | null
          montage: number | null
          montage_3: number | null
          montage2: number | null
          plus_minus_timer: number | null
          produktion: number | null
          projektering_1: number | null
          projektering_2: number | null
          responsible_person: string | null
          subject: string | null
          tilbud: number | null
          timer_tilbage_1: number | null
          timer_tilbage_2: number | null
          total: number | null
          underleverandor: number | null
          underleverandor2: number | null
          updated_at: string
        }
        Insert: {
          afsat_fragt?: number | null
          appointment_number: string
          created_at?: string
          est_timer_ift_faerdig_pct?: number | null
          faerdig_pct_ex_montage_foer?: number | null
          faerdig_pct_ex_montage_nu?: number | null
          hn_appointment_id?: number | null
          id?: string
          is_sub_appointment?: boolean | null
          materialer?: number | null
          montage?: number | null
          montage_3?: number | null
          montage2?: number | null
          plus_minus_timer?: number | null
          produktion?: number | null
          projektering_1?: number | null
          projektering_2?: number | null
          responsible_person?: string | null
          subject?: string | null
          tilbud?: number | null
          timer_tilbage_1?: number | null
          timer_tilbage_2?: number | null
          total?: number | null
          underleverandor?: number | null
          underleverandor2?: number | null
          updated_at?: string
        }
        Update: {
          afsat_fragt?: number | null
          appointment_number?: string
          created_at?: string
          est_timer_ift_faerdig_pct?: number | null
          faerdig_pct_ex_montage_foer?: number | null
          faerdig_pct_ex_montage_nu?: number | null
          hn_appointment_id?: number | null
          id?: string
          is_sub_appointment?: boolean | null
          materialer?: number | null
          montage?: number | null
          montage_3?: number | null
          montage2?: number | null
          plus_minus_timer?: number | null
          produktion?: number | null
          projektering_1?: number | null
          projektering_2?: number | null
          responsible_person?: string | null
          subject?: string | null
          tilbud?: number | null
          timer_tilbage_1?: number | null
          timer_tilbage_2?: number | null
          total?: number | null
          underleverandor?: number | null
          underleverandor2?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      fokusark_cells: {
        Row: {
          col_index: number
          created_at: string
          id: number
          row_index: number
          updated_at: string
          value: string
        }
        Insert: {
          col_index: number
          created_at?: string
          id?: number
          row_index: number
          updated_at?: string
          value: string
        }
        Update: {
          col_index?: number
          created_at?: string
          id?: number
          row_index?: number
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string
          id: string
          status: string
          task_id: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          status: string
          task_id: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          task_id?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
