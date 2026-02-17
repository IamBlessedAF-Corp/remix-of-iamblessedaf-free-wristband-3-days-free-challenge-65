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
      affiliate_tiers: {
        Row: {
          created_at: string
          credit_amount: number
          current_tier: string
          id: string
          tier_unlocked_at: string | null
          updated_at: string
          user_id: string
          wristbands_distributed: number
        }
        Insert: {
          created_at?: string
          credit_amount?: number
          current_tier?: string
          id?: string
          tier_unlocked_at?: string | null
          updated_at?: string
          user_id: string
          wristbands_distributed?: number
        }
        Update: {
          created_at?: string
          credit_amount?: number
          current_tier?: string
          id?: string
          tier_unlocked_at?: string | null
          updated_at?: string
          user_id?: string
          wristbands_distributed?: number
        }
        Relationships: []
      }
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
      budget_cycles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          emergency_reserve_cents: number
          end_date: string
          global_monthly_limit_cents: number
          global_weekly_limit_cents: number
          id: string
          max_payout_per_clip_cents: number
          max_payout_per_clipper_week_cents: number
          notes: string | null
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          emergency_reserve_cents?: number
          end_date: string
          global_monthly_limit_cents?: number
          global_weekly_limit_cents?: number
          id?: string
          max_payout_per_clip_cents?: number
          max_payout_per_clipper_week_cents?: number
          notes?: string | null
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          emergency_reserve_cents?: number
          end_date?: string
          global_monthly_limit_cents?: number
          global_weekly_limit_cents?: number
          id?: string
          max_payout_per_clip_cents?: number
          max_payout_per_clipper_week_cents?: number
          notes?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      budget_events_log: {
        Row: {
          action: string
          actor: string | null
          after_state: Json | null
          before_state: Json | null
          created_at: string
          estimated_impact_cents: number | null
          id: string
          impacted_segments: string[] | null
          notes: string | null
          rollback_token: string | null
        }
        Insert: {
          action: string
          actor?: string | null
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string
          estimated_impact_cents?: number | null
          id?: string
          impacted_segments?: string[] | null
          notes?: string | null
          rollback_token?: string | null
        }
        Update: {
          action?: string
          actor?: string | null
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string
          estimated_impact_cents?: number | null
          id?: string
          impacted_segments?: string[] | null
          notes?: string | null
          rollback_token?: string | null
        }
        Relationships: []
      }
      budget_segment_cycles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          cycle_id: string
          id: string
          projected_cents: number
          remaining_cents: number
          segment_id: string
          spent_cents: number
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          cycle_id: string
          id?: string
          projected_cents?: number
          remaining_cents?: number
          segment_id: string
          spent_cents?: number
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          cycle_id?: string
          id?: string
          projected_cents?: number
          remaining_cents?: number
          segment_id?: string
          spent_cents?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_segment_cycles_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "budget_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_segment_cycles_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "budget_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_segments: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          monthly_limit_cents: number
          name: string
          priority: number
          rules: Json
          soft_throttle_config: Json
          updated_at: string
          weekly_limit_cents: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          monthly_limit_cents?: number
          name: string
          priority?: number
          rules?: Json
          soft_throttle_config?: Json
          updated_at?: string
          weekly_limit_cents?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          monthly_limit_cents?: number
          name?: string
          priority?: number
          rules?: Json
          soft_throttle_config?: Json
          updated_at?: string
          weekly_limit_cents?: number
        }
        Relationships: []
      }
      challenge_participants: {
        Row: {
          challenge_start_date: string | null
          challenge_status: string | null
          created_at: string | null
          current_streak: number | null
          display_name: string | null
          friend_1_name: string
          friend_2_name: string | null
          friend_3_name: string | null
          id: string
          longest_streak: number | null
          opted_in_sms: boolean | null
          phone: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          challenge_start_date?: string | null
          challenge_status?: string | null
          created_at?: string | null
          current_streak?: number | null
          display_name?: string | null
          friend_1_name: string
          friend_2_name?: string | null
          friend_3_name?: string | null
          id?: string
          longest_streak?: number | null
          opted_in_sms?: boolean | null
          phone: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          challenge_start_date?: string | null
          challenge_status?: string | null
          created_at?: string | null
          current_streak?: number | null
          display_name?: string | null
          friend_1_name?: string
          friend_2_name?: string | null
          friend_3_name?: string | null
          id?: string
          longest_streak?: number | null
          opted_in_sms?: boolean | null
          phone?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      clip_submissions: {
        Row: {
          baseline_view_count: number
          clip_url: string
          created_at: string
          ctr: number | null
          day1_post_rate: number | null
          earnings_cents: number
          id: string
          is_activated: boolean | null
          net_views: number | null
          payout_week: string | null
          platform: string
          reg_rate: number | null
          status: string
          submitted_at: string
          updated_at: string
          user_id: string
          verified_at: string | null
          view_count: number
        }
        Insert: {
          baseline_view_count?: number
          clip_url: string
          created_at?: string
          ctr?: number | null
          day1_post_rate?: number | null
          earnings_cents?: number
          id?: string
          is_activated?: boolean | null
          net_views?: number | null
          payout_week?: string | null
          platform?: string
          reg_rate?: number | null
          status?: string
          submitted_at?: string
          updated_at?: string
          user_id: string
          verified_at?: string | null
          view_count?: number
        }
        Update: {
          baseline_view_count?: number
          clip_url?: string
          created_at?: string
          ctr?: number | null
          day1_post_rate?: number | null
          earnings_cents?: number
          id?: string
          is_activated?: boolean | null
          net_views?: number | null
          payout_week?: string | null
          platform?: string
          reg_rate?: number | null
          status?: string
          submitted_at?: string
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          view_count?: number
        }
        Relationships: []
      }
      clipper_monthly_bonuses: {
        Row: {
          bonus_cents: number | null
          bonus_tier: string | null
          created_at: string
          id: string
          lifetime_views: number | null
          month_key: string
          monthly_views: number | null
          paid: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bonus_cents?: number | null
          bonus_tier?: string | null
          created_at?: string
          id?: string
          lifetime_views?: number | null
          month_key: string
          monthly_views?: number | null
          paid?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bonus_cents?: number | null
          bonus_tier?: string | null
          created_at?: string
          id?: string
          lifetime_views?: number | null
          month_key?: string
          monthly_views?: number | null
          paid?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      clipper_payouts: {
        Row: {
          base_earnings_cents: number | null
          bonus_cents: number | null
          clips_count: number | null
          created_at: string
          frozen_at: string | null
          id: string
          notes: string | null
          paid_at: string | null
          reviewed_at: string | null
          status: string
          total_cents: number | null
          total_net_views: number | null
          updated_at: string
          user_id: string
          week_key: string
        }
        Insert: {
          base_earnings_cents?: number | null
          bonus_cents?: number | null
          clips_count?: number | null
          created_at?: string
          frozen_at?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          reviewed_at?: string | null
          status?: string
          total_cents?: number | null
          total_net_views?: number | null
          updated_at?: string
          user_id: string
          week_key: string
        }
        Update: {
          base_earnings_cents?: number | null
          bonus_cents?: number | null
          clips_count?: number | null
          created_at?: string
          frozen_at?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          reviewed_at?: string | null
          status?: string
          total_cents?: number | null
          total_net_views?: number | null
          updated_at?: string
          user_id?: string
          week_key?: string
        }
        Relationships: []
      }
      clipper_risk_throttle: {
        Row: {
          activated_at: string | null
          consecutive_low_days: number | null
          consecutive_recovery_days: number | null
          current_avg_ctr: number | null
          current_avg_day1_rate: number | null
          current_avg_reg_rate: number | null
          deactivated_at: string | null
          id: string
          is_active: boolean | null
          rpm_override: number | null
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          consecutive_low_days?: number | null
          consecutive_recovery_days?: number | null
          current_avg_ctr?: number | null
          current_avg_day1_rate?: number | null
          current_avg_reg_rate?: number | null
          deactivated_at?: string | null
          id?: string
          is_active?: boolean | null
          rpm_override?: number | null
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          consecutive_low_days?: number | null
          consecutive_recovery_days?: number | null
          current_avg_ctr?: number | null
          current_avg_day1_rate?: number | null
          current_avg_reg_rate?: number | null
          deactivated_at?: string | null
          id?: string
          is_active?: boolean | null
          rpm_override?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      clipper_segment_membership: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          segment_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          segment_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          segment_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clipper_segment_membership_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "budget_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_profiles: {
        Row: {
          blessings_confirmed: number
          congrats_completed: string | null
          created_at: string
          digest_opted_out: boolean
          display_name: string | null
          email: string
          id: string
          instagram_handle: string | null
          referral_code: string
          referred_by_code: string | null
          tiktok_handle: string | null
          twitter_handle: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          blessings_confirmed?: number
          congrats_completed?: string | null
          created_at?: string
          digest_opted_out?: boolean
          display_name?: string | null
          email: string
          id?: string
          instagram_handle?: string | null
          referral_code: string
          referred_by_code?: string | null
          tiktok_handle?: string | null
          twitter_handle?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          blessings_confirmed?: number
          congrats_completed?: string | null
          created_at?: string
          digest_opted_out?: boolean
          display_name?: string | null
          email?: string
          id?: string
          instagram_handle?: string | null
          referral_code?: string
          referred_by_code?: string | null
          tiktok_handle?: string | null
          twitter_handle?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exit_intent_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          page: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          page: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          page?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      expert_leads: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          niche: string | null
          source_page: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          niche?: string | null
          source_page?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          niche?: string | null
          source_page?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      expert_scripts: {
        Row: {
          created_at: string
          framework_id: string
          hero_profile: Json
          id: string
          output: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          framework_id: string
          hero_profile?: Json
          id?: string
          output: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          framework_id?: string
          hero_profile?: Json
          id?: string
          output?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      followup_sequences: {
        Row: {
          channel: string
          created_at: string
          id: string
          participant_id: string
          scheduled_at: string
          sent_at: string | null
          sequence_type: string
          status: string
          step_number: number
        }
        Insert: {
          channel?: string
          created_at?: string
          id?: string
          participant_id: string
          scheduled_at: string
          sent_at?: string | null
          sequence_type?: string
          status?: string
          step_number?: number
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          participant_id?: string
          scheduled_at?: string
          sent_at?: string | null
          sequence_type?: string
          status?: string
          step_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "followup_sequences_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "challenge_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      link_clicks: {
        Row: {
          browser: string | null
          city: string | null
          clicked_at: string
          country: string | null
          device_type: string | null
          id: string
          ip_hash: string | null
          link_id: string
          metadata: Json | null
          os: string | null
          referrer: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          clicked_at?: string
          country?: string | null
          device_type?: string | null
          id?: string
          ip_hash?: string | null
          link_id: string
          metadata?: Json | null
          os?: string | null
          referrer?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          clicked_at?: string
          country?: string | null
          device_type?: string | null
          id?: string
          ip_hash?: string | null
          link_id?: string
          metadata?: Json | null
          os?: string | null
          referrer?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "link_clicks_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "short_links"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          customer_email: string | null
          id: string
          referral_code: string | null
          status: string
          stripe_customer_id: string | null
          stripe_session_id: string
          tier: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          customer_email?: string | null
          id?: string
          referral_code?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_session_id: string
          tier: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          customer_email?: string | null
          id?: string
          referral_code?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_session_id?: string
          tier?: string
        }
        Relationships: []
      }
      otp_codes: {
        Row: {
          attempts: number
          code: string
          created_at: string
          expires_at: string
          id: string
          phone: string
          purpose: string
          user_id: string | null
          verified_at: string | null
        }
        Insert: {
          attempts?: number
          code: string
          created_at?: string
          expires_at: string
          id?: string
          phone: string
          purpose: string
          user_id?: string | null
          verified_at?: string | null
        }
        Update: {
          attempts?: number
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          phone?: string
          purpose?: string
          user_id?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      portal_activity: {
        Row: {
          created_at: string
          display_text: string
          event_type: string
          icon_name: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          display_text: string
          event_type: string
          icon_name?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          display_text?: string
          event_type?: string
          icon_name?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      repost_logs: {
        Row: {
          clip_id: string
          clip_title: string | null
          created_at: string
          id: string
          referral_link: string | null
          user_id: string
        }
        Insert: {
          clip_id: string
          clip_title?: string | null
          created_at?: string
          id?: string
          referral_link?: string | null
          user_id: string
        }
        Update: {
          clip_id?: string
          clip_title?: string | null
          created_at?: string
          id?: string
          referral_link?: string | null
          user_id?: string
        }
        Relationships: []
      }
      scheduled_gratitude_messages: {
        Row: {
          created_at: string | null
          day_number: number
          friend_name: string
          id: string
          message_body: string
          message_sent_at: string | null
          participant_id: string
          reminder_send_at: string | null
          scheduled_send_at: string | null
          status: string | null
          twilio_message_sid: string | null
          twilio_reminder_sid: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_number: number
          friend_name: string
          id?: string
          message_body: string
          message_sent_at?: string | null
          participant_id: string
          reminder_send_at?: string | null
          scheduled_send_at?: string | null
          status?: string | null
          twilio_message_sid?: string | null
          twilio_reminder_sid?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_number?: number
          friend_name?: string
          id?: string
          message_body?: string
          message_sent_at?: string | null
          participant_id?: string
          reminder_send_at?: string | null
          scheduled_send_at?: string | null
          status?: string | null
          twilio_message_sid?: string | null
          twilio_reminder_sid?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_gratitude_messages_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "challenge_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      short_links: {
        Row: {
          campaign: string | null
          click_count: number
          created_at: string
          created_by: string | null
          destination_url: string
          expires_at: string | null
          id: string
          is_active: boolean
          metadata: Json | null
          short_code: string
          source_page: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          campaign?: string | null
          click_count?: number
          created_at?: string
          created_by?: string | null
          destination_url: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          short_code: string
          source_page?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          campaign?: string | null
          click_count?: number
          created_at?: string
          created_by?: string | null
          destination_url?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          short_code?: string
          source_page?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      smart_wristband_waitlist: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          phone: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          phone?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          phone?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sms_audit_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          messaging_service_sid: string
          metadata: Json | null
          recipient_phone: string
          status: string
          template_key: string
          traffic_type: string
          twilio_sid: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          messaging_service_sid: string
          metadata?: Json | null
          recipient_phone: string
          status?: string
          template_key: string
          traffic_type: string
          twilio_sid?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          messaging_service_sid?: string
          metadata?: Json | null
          recipient_phone?: string
          status?: string
          template_key?: string
          traffic_type?: string
          twilio_sid?: string | null
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
      tgf_friday_contacts: {
        Row: {
          created_at: string
          friend_name: string
          id: string
          last_sent_at: string | null
          participant_id: string | null
          referral_link: string | null
          send_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_name: string
          id?: string
          last_sent_at?: string | null
          participant_id?: string | null
          referral_link?: string | null
          send_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          friend_name?: string
          id?: string
          last_sent_at?: string | null
          participant_id?: string | null
          referral_link?: string | null
          send_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tgf_friday_contacts_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "challenge_participants"
            referencedColumns: ["id"]
          },
        ]
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
      cleanup_expired_otps: { Args: never; Returns: undefined }
      confirm_blessing: { Args: { token: string }; Returns: Json }
      generate_referral_code: { Args: never; Returns: string }
      generate_short_code: { Args: never; Returns: string }
      get_affiliate_wristband_count: {
        Args: { p_referral_code: string }
        Returns: number
      }
      get_global_blessing_count: { Args: never; Returns: number }
      get_smart_reservation_count: { Args: never; Returns: number }
      get_total_meals_donated: { Args: never; Returns: number }
      get_wristband_waitlist_count: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_click_count: { Args: { p_link_id: string }; Returns: undefined }
      log_portal_activity: {
        Args: {
          p_display_text: string
          p_event_type: string
          p_icon_name?: string
          p_user_id?: string
        }
        Returns: undefined
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
