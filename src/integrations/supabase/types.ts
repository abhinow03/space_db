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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agencies: {
        Row: {
          country: string
          created_at: string
          description: string | null
          founded_year: number | null
          id: string
          name: string
          website: string | null
        }
        Insert: {
          country: string
          created_at?: string
          description?: string | null
          founded_year?: number | null
          id?: string
          name: string
          website?: string | null
        }
        Update: {
          country?: string
          created_at?: string
          description?: string | null
          founded_year?: number | null
          id?: string
          name?: string
          website?: string | null
        }
        Relationships: []
      }
      crew_assignments: {
        Row: {
          assignment_date: string | null
          created_at: string
          crew_member_id: string
          id: string
          mission_id: string
          role: string
        }
        Insert: {
          assignment_date?: string | null
          created_at?: string
          crew_member_id: string
          id?: string
          mission_id: string
          role: string
        }
        Update: {
          assignment_date?: string | null
          created_at?: string
          crew_member_id?: string
          id?: string
          mission_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "crew_assignments_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_assignments_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_members: {
        Row: {
          bio: string | null
          created_at: string
          date_of_birth: string | null
          id: string
          missions_count: number | null
          name: string
          nationality: string
          role: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          id?: string
          missions_count?: number | null
          name: string
          nationality: string
          role: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          id?: string
          missions_count?: number | null
          name?: string
          nationality?: string
          role?: string
        }
        Relationships: []
      }
      launches: {
        Row: {
          created_at: string
          id: string
          launch_date: string
          launch_site: string
          mission_id: string | null
          notes: string | null
          rocket_variant_id: string | null
          status: string
          success: boolean | null
        }
        Insert: {
          created_at?: string
          id?: string
          launch_date: string
          launch_site: string
          mission_id?: string | null
          notes?: string | null
          rocket_variant_id?: string | null
          status?: string
          success?: boolean | null
        }
        Update: {
          created_at?: string
          id?: string
          launch_date?: string
          launch_site?: string
          mission_id?: string | null
          notes?: string | null
          rocket_variant_id?: string | null
          status?: string
          success?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "launches_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "launches_rocket_variant_id_fkey"
            columns: ["rocket_variant_id"]
            isOneToOne: false
            referencedRelation: "rocket_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturers: {
        Row: {
          country: string
          created_at: string
          founded_year: number | null
          id: string
          name: string
          specialization: string | null
        }
        Insert: {
          country: string
          created_at?: string
          founded_year?: number | null
          id?: string
          name: string
          specialization?: string | null
        }
        Update: {
          country?: string
          created_at?: string
          founded_year?: number | null
          id?: string
          name?: string
          specialization?: string | null
        }
        Relationships: []
      }
      missions: {
        Row: {
          agency_id: string | null
          budget_usd: number | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          mission_type: string
          name: string
          start_date: string | null
          status: string
        }
        Insert: {
          agency_id?: string | null
          budget_usd?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          mission_type: string
          name: string
          start_date?: string | null
          status?: string
        }
        Update: {
          agency_id?: string | null
          budget_usd?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          mission_type?: string
          name?: string
          start_date?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "missions_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      payloads: {
        Row: {
          created_at: string
          description: string | null
          id: string
          launch_id: string | null
          mass_kg: number | null
          name: string
          orbit: string | null
          type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          launch_id?: string | null
          mass_kg?: number | null
          name: string
          orbit?: string | null
          type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          launch_id?: string | null
          mass_kg?: number | null
          name?: string
          orbit?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "payloads_launch_id_fkey"
            columns: ["launch_id"]
            isOneToOne: false
            referencedRelation: "launches"
            referencedColumns: ["id"]
          },
        ]
      }
      rocket_variants: {
        Row: {
          created_at: string
          description: string | null
          id: string
          payload_capacity_kg: number | null
          rocket_id: string
          stages: number | null
          variant_name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          payload_capacity_kg?: number | null
          rocket_id: string
          stages?: number | null
          variant_name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          payload_capacity_kg?: number | null
          rocket_id?: string
          stages?: number | null
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "rocket_variants_rocket_id_fkey"
            columns: ["rocket_id"]
            isOneToOne: false
            referencedRelation: "rockets"
            referencedColumns: ["id"]
          },
        ]
      }
      rockets: {
        Row: {
          created_at: string
          description: string | null
          height_meters: number | null
          id: string
          manufacturer_id: string | null
          mass_kg: number | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          height_meters?: number | null
          id?: string
          manufacturer_id?: string | null
          mass_kg?: number | null
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          height_meters?: number | null
          id?: string
          manufacturer_id?: string | null
          mass_kg?: number | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "rockets_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
        ]
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
