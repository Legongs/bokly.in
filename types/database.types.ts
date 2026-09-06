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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
  public: {
    Tables: {
      app_settings: {
        Row: {
          id: string
          updated_at: string
          value: Json
        }
        Insert: {
          id: string
          updated_at?: string
          value: Json
        }
        Update: {
          id?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      billing_intents: {
        Row: {
          amount: number
          billing_cycle: string
          created_at: string
          id: string
          midtrans_order_id: string | null
          midtrans_token: string | null
          plan: string
          status: string
          tenant_id: string
          voucher_id: string | null
        }
        Insert: {
          amount: number
          billing_cycle: string
          created_at?: string
          id?: string
          midtrans_order_id?: string | null
          midtrans_token?: string | null
          plan: string
          status?: string
          tenant_id: string
          voucher_id?: string | null
        }
        Update: {
          amount?: number
          billing_cycle?: string
          created_at?: string
          id?: string
          midtrans_order_id?: string | null
          midtrans_token?: string | null
          plan?: string
          status?: string
          tenant_id?: string
          voucher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_intents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_intents_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_items: {
        Row: {
          booking_id: string
          created_at: string | null
          duration_minutes: number
          id: string
          price: number
          service_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          duration_minutes: number
          id?: string
          price: number
          service_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          duration_minutes?: number
          id?: string
          price?: number
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_items_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_date: string
          created_at: string | null
          customer_id: string | null
          customer_name: string
          customer_wa: string
          end_time: string
          id: string
          is_no_show: boolean | null
          is_reminder_sent: boolean | null
          manage_token: string
          manage_token_expires_at: string | null
          payment_status: string | null
          proof_url: string | null
          reminder_h1_sent: boolean | null
          reminder_h2_sent: boolean | null
          reminder_h3_sent: boolean | null
          reminder_sent: boolean
          reschedule_request: Json | null
          service_id: string
          staff_id: string | null
          start_time: string
          tenant_id: string
        }
        Insert: {
          booking_date: string
          created_at?: string | null
          customer_id?: string | null
          customer_name: string
          customer_wa: string
          end_time: string
          id?: string
          is_no_show?: boolean | null
          is_reminder_sent?: boolean | null
          manage_token?: string
          manage_token_expires_at?: string | null
          payment_status?: string | null
          proof_url?: string | null
          reminder_h1_sent?: boolean | null
          reminder_h2_sent?: boolean | null
          reminder_h3_sent?: boolean | null
          reminder_sent?: boolean
          reschedule_request?: Json | null
          service_id: string
          staff_id?: string | null
          start_time: string
          tenant_id: string
        }
        Update: {
          booking_date?: string
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_wa?: string
          end_time?: string
          id?: string
          is_no_show?: boolean | null
          is_reminder_sent?: boolean | null
          manage_token?: string
          manage_token_expires_at?: string | null
          payment_status?: string | null
          proof_url?: string | null
          reminder_h1_sent?: boolean | null
          reminder_h2_sent?: boolean | null
          reminder_h3_sent?: boolean | null
          reminder_sent?: boolean
          reschedule_request?: Json | null
          service_id?: string
          staff_id?: string | null
          start_time?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          id: string
          name: string
          tenant_id: string
          total_bookings: number
          updated_at: string
          whatsapp_number: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          tenant_id: string
          total_bookings?: number
          updated_at?: string
          whatsapp_number: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          tenant_id?: string
          total_bookings?: number
          updated_at?: string
          whatsapp_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          created_at: string
          id: string
          image_url: string
          tenant_id: string
          title: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          tenant_id: string
          title?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          tenant_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          end_date: string
          id: string
          is_active: boolean
          start_date: string
          tenant_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_type: string
          discount_value: number
          end_date: string
          id?: string
          is_active?: boolean
          start_date: string
          tenant_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string
          id?: string
          is_active?: boolean
          start_date?: string
          tenant_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          keys_auth: string
          keys_p256dh: string
          subscription_type: string
          tenant_id: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          keys_auth: string
          keys_p256dh: string
          subscription_type?: string
          tenant_id?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          keys_auth?: string
          keys_p256dh?: string
          subscription_type?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          count: number
          expires_at: string
          key: string
        }
        Insert: {
          count?: number
          expires_at: string
          key: string
        }
        Update: {
          count?: number
          expires_at?: string
          key?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          buffer_minutes: number
          category: string | null
          dp_amount: number | null
          duration_minutes: number
          duration_step_minutes: number | null
          id: string
          is_active: boolean | null
          is_female_only: boolean | null
          is_flexible_duration: boolean | null
          max_capacity: number | null
          max_duration_minutes: number | null
          min_duration_minutes: number | null
          name: string
          price: number
          service_category: string | null
          specialty_tag: string | null
          tenant_id: string
        }
        Insert: {
          buffer_minutes?: number
          category?: string | null
          dp_amount?: number | null
          duration_minutes: number
          duration_step_minutes?: number | null
          id?: string
          is_active?: boolean | null
          is_female_only?: boolean | null
          is_flexible_duration?: boolean | null
          max_capacity?: number | null
          max_duration_minutes?: number | null
          min_duration_minutes?: number | null
          name: string
          price: number
          service_category?: string | null
          specialty_tag?: string | null
          tenant_id: string
        }
        Update: {
          buffer_minutes?: number
          category?: string | null
          dp_amount?: number | null
          duration_minutes?: number
          duration_step_minutes?: number | null
          id?: string
          is_active?: boolean | null
          is_female_only?: boolean | null
          is_flexible_duration?: boolean | null
          max_capacity?: number | null
          max_duration_minutes?: number | null
          min_duration_minutes?: number | null
          name?: string
          price?: number
          service_category?: string | null
          specialty_tag?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          description: string | null
          google_refresh_token: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          role: string | null
          tenant_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          google_refresh_token?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          role?: string | null
          tenant_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          google_refresh_token?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          role?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_services: {
        Row: {
          created_at: string
          service_id: string
          staff_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          service_id: string
          staff_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          service_id?: string
          staff_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_services_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_services_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_cycle: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          midtrans_order_id: string | null
          plan: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          midtrans_order_id?: string | null
          plan?: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          midtrans_order_id?: string | null
          plan?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_facilities: {
        Row: {
          created_at: string | null
          facility_type: string
          id: string
          is_available: boolean | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          facility_type: string
          id?: string
          is_available?: boolean | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          facility_type?: string
          id?: string
          is_available?: boolean | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_facilities_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          address: string | null
          bank_account_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          business_name: string
          business_sector:
            | Database["public"]["Enums"]["business_sector_enum"]
            | null
          business_type: string | null
          cancellation_policy: string | null
          close_time: string | null
          created_at: string | null
          google_refresh_token: string | null
          hero_image_url: string | null
          id: string
          instagram_handle: string | null
          is_active: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          minimum_notice_hours: number | null
          open_time: string | null
          payment_gateway_client_key: string | null
          payment_gateway_provider: string | null
          payment_gateway_server_key: string | null
          payment_method_type: string
          qris_image_url: string | null
          slug: string
          telegram_chat_id: string | null
          template_id: string
          theme_color: string | null
          timezone: string
          updated_at: string | null
          user_id: string | null
          wa_api_key: string | null
          wa_method: string | null
          weekly_schedule: Json | null
          welcome_message: string | null
          whatsapp_number: string
        }
        Insert: {
          address?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          business_name: string
          business_sector?:
            | Database["public"]["Enums"]["business_sector_enum"]
            | null
          business_type?: string | null
          cancellation_policy?: string | null
          close_time?: string | null
          created_at?: string | null
          google_refresh_token?: string | null
          hero_image_url?: string | null
          id?: string
          instagram_handle?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          minimum_notice_hours?: number | null
          open_time?: string | null
          payment_gateway_client_key?: string | null
          payment_gateway_provider?: string | null
          payment_gateway_server_key?: string | null
          payment_method_type?: string
          qris_image_url?: string | null
          slug: string
          telegram_chat_id?: string | null
          template_id?: string
          theme_color?: string | null
          timezone?: string
          updated_at?: string | null
          user_id?: string | null
          wa_api_key?: string | null
          wa_method?: string | null
          weekly_schedule?: Json | null
          welcome_message?: string | null
          whatsapp_number: string
        }
        Update: {
          address?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          business_name?: string
          business_sector?:
            | Database["public"]["Enums"]["business_sector_enum"]
            | null
          business_type?: string | null
          cancellation_policy?: string | null
          close_time?: string | null
          created_at?: string | null
          google_refresh_token?: string | null
          hero_image_url?: string | null
          id?: string
          instagram_handle?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          minimum_notice_hours?: number | null
          open_time?: string | null
          payment_gateway_client_key?: string | null
          payment_gateway_provider?: string | null
          payment_gateway_server_key?: string | null
          payment_method_type?: string
          qris_image_url?: string | null
          slug?: string
          telegram_chat_id?: string | null
          template_id?: string
          theme_color?: string | null
          timezone?: string
          updated_at?: string | null
          user_id?: string | null
          wa_api_key?: string | null
          wa_method?: string | null
          weekly_schedule?: Json | null
          welcome_message?: string | null
          whatsapp_number?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          booking_id: string | null
          comment: string | null
          created_at: string
          customer_name: string
          id: string
          is_featured: boolean
          is_published: boolean
          rating: number
          tenant_id: string
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          customer_name: string
          id?: string
          is_featured?: boolean
          is_published?: boolean
          rating: number
          tenant_id: string
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          customer_name?: string
          id?: string
          is_featured?: boolean
          is_published?: boolean
          rating?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonials_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      vouchers: {
        Row: {
          code: string
          created_at: string
          current_uses: number
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          max_uses: number | null
          updated_at: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: { p_key: string; p_limit: number; p_window_ms: number }
        Returns: boolean
      }
      create_booking_secure: {
        Args: {
          p_booking_date: string
          p_customer_name: string
          p_customer_wa: string
          p_end_time: string
          p_manage_token_expires_at: string
          p_payment_status: string
          p_proof_url: string
          p_service_id: string
          p_staff_id: string
          p_start_time: string
          p_tenant_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      business_sector_enum: "beauty" | "space" | "auto" | "health"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      business_sector_enum: ["beauty", "space", "auto", "health"],
    },
  },
} as const

// ==========================================
// Custom Aliases
// ==========================================
export type Tenant = Database['public']['Tables']['tenants']['Row'];
export type Service = Database['public']['Tables']['services']['Row'];
export type Customer = Database['public']['Tables']['customers']['Row'];
export type Portfolio = Database['public']['Tables']['portfolios']['Row'];
export type Staff = Database['public']['Tables']['staff']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type Testimonial = Database['public']['Tables']['testimonials']['Row'];
export type Promotion = Database['public']['Tables']['promotions']['Row'];
export type Facility = Database['public']['Tables']['tenant_facilities']['Row'];

export type PaymentStatus = "pending" | "approved" | "rejected" | "refunded" | "failed" | "cancelled";
export type SubscriptionPlan = "free" | "pro" | "bisnis";
export type BillingCycle = "monthly" | "yearly";

export type StaffWithServices = Staff & {
  staff_services?: {
    service_id: string;
    services?: Service;
  }[];
};
