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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bc_redemptions: {
        Row: {
          cost_bc: number
          created_at: string
          id: string
          redemption_code: string | null
          status: string
          store_item_id: string
          user_id: string
        }
        Insert: {
          cost_bc: number
          created_at?: string
          id?: string
          redemption_code?: string | null
          status?: string
          store_item_id: string
          user_id: string
        }
        Update: {
          cost_bc?: number
          created_at?: string
          id?: string
          redemption_code?: string | null
          status?: string
          store_item_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bc_redemptions_store_item_id_fkey"
            columns: ["store_item_id"]
            isOneToOne: false
            referencedRelation: "bc_store_items"
            referencedColumns: ["id"]
          },
        ]
      }
      bc_store_items: {
        Row: {
          category: string
          cost_bc: number
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          reward_type: string
          reward_value: Json
          sort_order: number
          stock: number | null
        }
        Insert: {
          category?: string
          cost_bc: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          reward_type?: string
          reward_value?: Json
          sort_order?: number
          stock?: number | null
        }
        Update: {
          category?: string
          cost_bc?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          reward_type?: string
          reward_value?: Json
          sort_order?: number
          stock?: number | null
        }
        Relationships: []
      }
      bc_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          id: string
          metadata: Json | null
          reason: string
          type: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          balance_after?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          reason: string
          type: string
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          reason?: string
          type?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bc_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "bc_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      bc_wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          last_login_bonus_at: string | null
          lifetime_earned: number
          lifetime_spent: number
          streak_days: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          last_login_bonus_at?: string | null
          lifetime_earned?: number
          lifetime_spent?: number
          streak_days?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          last_login_bonus_at?: string | null
          lifetime_earned?: number
          lifetime_spent?: number
          streak_days?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      blessings: {
        Row: {
          confirmation_token: string
          confirmed_at: string | null
          created_at: string
          expires_at: string
          id: string
          recipient_name: string | null
          sender_id: string
        }
        Insert: {
          confirmation_token?: string
          confirmed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          recipient_name?: string | null
          sender_id: string
        }
        Update: {
          confirmation_token?: string
          confirmed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          recipient_name?: string | null
          sender_id?: string
        }
        Relationships: []
      }
      board_cards: {
        Row: {
          ad_score: number | null
          cc_score: number | null
          column_id: string
          completed_at: string | null
          created_at: string
          delegation_score: number | null
          description: string | null
          hu_score: number | null
          id: string
          labels: string[] | null
          logs: string | null
          master_prompt: string | null
          position: number
          preview_link: string | null
          priority: string | null
          r_score: number | null
          screenshots: string[] | null
          stage: string | null
          staging_status: string | null
          summary: string | null
          title: string
          updated_at: string
          vs_score: number | null
        }
        Insert: {
          ad_score?: number | null
          cc_score?: number | null
          column_id: string
          completed_at?: string | null
          created_at?: string
          delegation_score?: number | null
          description?: string | null
          hu_score?: number | null
          id?: string
          labels?: string[] | null
          logs?: string | null
          master_prompt?: string | null
          position?: number
          preview_link?: string | null
          priority?: string | null
          r_score?: number | null
          screenshots?: string[] | null
          stage?: string | null
          staging_status?: string | null
          summary?: string | null
          title: string
          updated_at?: string
          vs_score?: number | null
        }
        Update: {
          ad_score?: number | null
          cc_score?: number | null
          column_id?: string
          completed_at?: string | null
          created_at?: string
          delegation_score?: number | null
          description?: string | null
          hu_score?: number | null
          id?: string
          labels?: string[] | null
          logs?: string | null
          master_prompt?: string | null
          position?: number
          preview_link?: string | null
          priority?: string | null
          r_score?: number | null
          screenshots?: string[] | null
          stage?: string | null
          staging_status?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
          vs_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "board_cards_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "board_columns"
            referencedColumns: ["id"]
          },
        ]
      }
      board_columns: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          position: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          position: number
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          position?: number
        }
        Relationships: []
      }
      creator_profiles: {
        Row: {
          blessings_confirmed: number
          created_at: string
          display_name: string | null
          email: string
          id: string
          instagram_handle: string | null
          referral_code: string
          tiktok_handle: string | null
          twitter_handle: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          blessings_confirmed?: number
          created_at?: string
          display_name?: string | null
          email: string
          id?: string
          instagram_handle?: string | null
          referral_code: string
          tiktok_handle?: string | null
          twitter_handle?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          blessings_confirmed?: number
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          instagram_handle?: string | null
          referral_code?: string
          tiktok_handle?: string | null
          twitter_handle?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sms_deliveries: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message: string
          recipient_name: string | null
          recipient_phone: string
          source_page: string | null
          status: string
          twilio_sid: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message: string
          recipient_name?: string | null
          recipient_phone: string
          source_page?: string | null
          status?: string
          twilio_sid?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message?: string
          recipient_name?: string | null
          recipient_phone?: string
          source_page?: string | null
          status?: string
          twilio_sid?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      creator_profiles_public: {
        Row: {
          blessings_confirmed: number | null
          created_at: string | null
          display_name: string | null
          id: string | null
          referral_code: string | null
          user_id: string | null
        }
        Insert: {
          blessings_confirmed?: number | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          referral_code?: string | null
          user_id?: string | null
        }
        Update: {
          blessings_confirmed?: number | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          referral_code?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      confirm_blessing: { Args: { token: string }; Returns: Json }
      generate_referral_code: { Args: never; Returns: string }
      get_global_blessing_count: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
