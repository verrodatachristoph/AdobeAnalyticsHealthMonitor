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
      agencies: {
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
      annotations: {
        Row: {
          client_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string
          id: string
          label: string
          property_id: string | null
          starts_at: string
          suppress_checks: string[]
          suppresses_alerts: boolean
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at: string
          id?: string
          label: string
          property_id?: string | null
          starts_at: string
          suppress_checks?: string[]
          suppresses_alerts?: boolean
        }
        Update: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string
          id?: string
          label?: string
          property_id?: string | null
          starts_at?: string
          suppress_checks?: string[]
          suppresses_alerts?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "annotations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annotations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      anomalies: {
        Row: {
          ack_at: string | null
          ack_note: string | null
          ack_user_id: string | null
          check_id: string
          client_would_have_noticed: boolean | null
          contributing_checks: string[]
          created_at: string
          ended_at: string | null
          estimated_data_at_risk: string | null
          id: string
          property_id: string
          reports_affected: string[] | null
          resolution_note: string | null
          resolved_at: string | null
          root_cause_category: string | null
          severity: string
          started_at: string
          state: string
          tags_touched: string[] | null
        }
        Insert: {
          ack_at?: string | null
          ack_note?: string | null
          ack_user_id?: string | null
          check_id: string
          client_would_have_noticed?: boolean | null
          contributing_checks?: string[]
          created_at?: string
          ended_at?: string | null
          estimated_data_at_risk?: string | null
          id?: string
          property_id: string
          reports_affected?: string[] | null
          resolution_note?: string | null
          resolved_at?: string | null
          root_cause_category?: string | null
          severity: string
          started_at?: string
          state?: string
          tags_touched?: string[] | null
        }
        Update: {
          ack_at?: string | null
          ack_note?: string | null
          ack_user_id?: string | null
          check_id?: string
          client_would_have_noticed?: boolean | null
          contributing_checks?: string[]
          created_at?: string
          ended_at?: string | null
          estimated_data_at_risk?: string | null
          id?: string
          property_id?: string
          reports_affected?: string[] | null
          resolution_note?: string | null
          resolved_at?: string | null
          root_cause_category?: string | null
          severity?: string
          started_at?: string
          state?: string
          tags_touched?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "anomalies_check_id_fkey"
            columns: ["check_id"]
            isOneToOne: false
            referencedRelation: "checks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anomalies_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      checks: {
        Row: {
          baseline_window_days: number
          cold_start_until: string | null
          config: Json
          created_at: string
          created_by: string | null
          enabled: boolean
          id: string
          kind: string
          last_evaluated_at: string | null
          mute_reason: string | null
          muted_until: string | null
          name: string
          owned_by: string | null
          property_id: string
          sensitivity_tier: string
          severity_mapping: Json
          visible_to_client: boolean
          weight_tier: string
        }
        Insert: {
          baseline_window_days?: number
          cold_start_until?: string | null
          config?: Json
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          id?: string
          kind: string
          last_evaluated_at?: string | null
          mute_reason?: string | null
          muted_until?: string | null
          name: string
          owned_by?: string | null
          property_id: string
          sensitivity_tier?: string
          severity_mapping?: Json
          visible_to_client?: boolean
          weight_tier?: string
        }
        Update: {
          baseline_window_days?: number
          cold_start_until?: string | null
          config?: Json
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          id?: string
          kind?: string
          last_evaluated_at?: string | null
          mute_reason?: string | null
          muted_until?: string | null
          name?: string
          owned_by?: string | null
          property_id?: string
          sensitivity_tier?: string
          severity_mapping?: Json
          visible_to_client?: boolean
          weight_tier?: string
        }
        Relationships: [
          {
            foreignKeyName: "checks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          agency_id: string
          created_at: string
          id: string
          name: string
          timezone: string
        }
        Insert: {
          agency_id: string
          created_at?: string
          id?: string
          name: string
          timezone?: string
        }
        Update: {
          agency_id?: string
          created_at?: string
          id?: string
          name?: string
          timezone?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          actor_user_id: string | null
          anomaly_id: string | null
          id: number
          message: string | null
          property_id: string
          ts: string
          type: string
        }
        Insert: {
          actor_user_id?: string | null
          anomaly_id?: string | null
          id?: never
          message?: string | null
          property_id: string
          ts?: string
          type: string
        }
        Update: {
          actor_user_id?: string | null
          anomaly_id?: string | null
          id?: never
          message?: string | null
          property_id?: string
          ts?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_anomaly_id_fkey"
            columns: ["anomaly_id"]
            isOneToOne: false
            referencedRelation: "anomalies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          access_token_expires_at: string | null
          access_token_vault_id: string | null
          adobe_access_token_plaintext: string | null
          adobe_client_secret_plaintext: string | null
          adobe_company_id: string | null
          adobe_last_refreshed_at: string | null
          adobe_organization_id: string | null
          adobe_refresh_error: string | null
          client_id: string
          client_id_adobe: string | null
          client_secret_vault_id: string | null
          created_at: string
          id: string
          last_validated_at: string | null
          technical_account_id: string | null
        }
        Insert: {
          access_token_expires_at?: string | null
          access_token_vault_id?: string | null
          adobe_access_token_plaintext?: string | null
          adobe_client_secret_plaintext?: string | null
          adobe_company_id?: string | null
          adobe_last_refreshed_at?: string | null
          adobe_organization_id?: string | null
          adobe_refresh_error?: string | null
          client_id: string
          client_id_adobe?: string | null
          client_secret_vault_id?: string | null
          created_at?: string
          id?: string
          last_validated_at?: string | null
          technical_account_id?: string | null
        }
        Update: {
          access_token_expires_at?: string | null
          access_token_vault_id?: string | null
          adobe_access_token_plaintext?: string | null
          adobe_client_secret_plaintext?: string | null
          adobe_company_id?: string | null
          adobe_last_refreshed_at?: string | null
          adobe_organization_id?: string | null
          adobe_refresh_error?: string | null
          client_id?: string
          client_id_adobe?: string | null
          client_secret_vault_id?: string | null
          created_at?: string
          id?: string
          last_validated_at?: string | null
          technical_account_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integrations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          agency_id: string
          client_id: string | null
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          agency_id: string
          client_id?: string | null
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          agency_id?: string
          client_id?: string | null
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      metric_snapshots: {
        Row: {
          baseline_high: number | null
          baseline_low: number | null
          id: number
          ingested_at: string
          metric: string
          property_id: string
          ts_bucket: string
          value: number
        }
        Insert: {
          baseline_high?: number | null
          baseline_low?: number | null
          id?: never
          ingested_at?: string
          metric: string
          property_id: string
          ts_bucket: string
          value: number
        }
        Update: {
          baseline_high?: number | null
          baseline_low?: number | null
          id?: never
          ingested_at?: string
          metric?: string
          property_id?: string
          ts_bucket?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "metric_snapshots_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          adobe_report_suite_id: string
          client_id: string
          created_at: string
          id: string
          integration_id: string
          name: string
          next_poll_at: string | null
          poll_interval_minutes: number
          status: string
        }
        Insert: {
          adobe_report_suite_id: string
          client_id: string
          created_at?: string
          id?: string
          integration_id: string
          name: string
          next_poll_at?: string | null
          poll_interval_minutes?: number
          status?: string
        }
        Update: {
          adobe_report_suite_id?: string
          client_id?: string
          created_at?: string
          id?: string
          integration_id?: string
          name?: string
          next_poll_at?: string | null
          poll_interval_minutes?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      starred_checks: {
        Row: {
          check_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          check_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          check_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "starred_checks_check_id_fkey"
            columns: ["check_id"]
            isOneToOne: false
            referencedRelation: "checks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_agency_admin: { Args: never; Returns: boolean }
      is_agency_role: { Args: never; Returns: boolean }
      user_client_ids: { Args: never; Returns: string[] }
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
