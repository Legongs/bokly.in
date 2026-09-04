export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PaymentStatus = "pending" | "pending_verification" | "approved" | "rejected" | "completed";

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          slug: string;
          business_name: string;
          business_type: string;
          whatsapp_number: string;
          telegram_chat_id: string | null;
          qris_image_url: string | null;
          is_active: boolean;
          theme_color: string;
          business_sector: Database["public"]["Enums"]["business_sector_enum"] | null;
          template_id: string;
          open_time: string;
          close_time: string;
          payment_method_type: string;
          payment_gateway_provider: string | null;
          payment_gateway_server_key: string | null;
          payment_gateway_client_key: string | null;
          wa_method: "manual" | "api";
          wa_api_key: string | null;
          hero_image_url: string | null;
          logo_url: string | null;
          welcome_message: string | null;
          address: string | null;
          instagram_handle: string | null;
          cancellation_policy: string | null;
          bank_account_details: string | null;
          timezone: string | null;
          weekly_schedule: Json | null;
          minimum_notice_hours: number;
          google_refresh_token: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          business_name: string;
          business_type: string;
          whatsapp_number: string;
          telegram_chat_id?: string | null;
          qris_image_url?: string | null;
          is_active?: boolean;
          theme_color?: string;
          business_sector?: Database["public"]["Enums"]["business_sector_enum"] | null;
          template_id?: string;
          open_time?: string;
          close_time?: string;
          payment_method_type?: string;
          payment_gateway_provider?: string | null;
          payment_gateway_server_key?: string | null;
          payment_gateway_client_key?: string | null;
          wa_method?: "manual" | "api";
          wa_api_key?: string | null;
          hero_image_url?: string | null;
          logo_url?: string | null;
          welcome_message?: string | null;
          address?: string | null;
          instagram_handle?: string | null;
          cancellation_policy?: string | null;
          bank_account_details?: string | null;
          timezone?: string | null;
          weekly_schedule?: Json | null;
          minimum_notice_hours?: number;
          google_refresh_token?: string | null;

          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          business_name?: string;
          business_type?: string;
          whatsapp_number?: string;
          telegram_chat_id?: string | null;
          qris_image_url?: string | null;
          is_active?: boolean;
          theme_color?: string;
          business_sector?: Database["public"]["Enums"]["business_sector_enum"] | null;
          template_id?: string;
          open_time?: string;
          close_time?: string;
          payment_method_type?: string;
          payment_gateway_provider?: string | null;
          payment_gateway_server_key?: string | null;
          payment_gateway_client_key?: string | null;
          wa_method?: "manual" | "api";
          wa_api_key?: string | null;
          hero_image_url?: string | null;
          logo_url?: string | null;
          welcome_message?: string | null;
          address?: string | null;
          instagram_handle?: string | null;
          cancellation_policy?: string | null;
          bank_account_details?: string | null;
          timezone?: string;
          weekly_schedule?: Json | null;
          minimum_notice_hours?: number;
          google_refresh_token?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          duration_minutes: number;
          buffer_minutes: number;
          price: number;
          dp_amount: number;
          max_capacity: number;
          category?: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          duration_minutes: number;
          buffer_minutes?: number;
          price: number;
          dp_amount?: number;
          max_capacity?: number;
          category?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          duration_minutes?: number;
          buffer_minutes?: number;
          price?: number;
          dp_amount?: number;
          max_capacity?: number;
          category?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "services_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          }
        ];
      };
      staff: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          role: string | null;
          description: string | null;
          image_url: string | null;
          google_refresh_token: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          role?: string | null;
          description?: string | null;
          image_url?: string | null;
          google_refresh_token?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          role?: string | null;
          description?: string | null;
          image_url?: string | null;
          google_refresh_token?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "staff_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          }
        ];
      };
      portfolios: {
        Row: {
          id: string;
          tenant_id: string;
          image_url: string;
          title: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          image_url: string;
          title?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          image_url?: string;
          title?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "portfolios_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          }
        ];
      };
      customers: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          whatsapp_number: string;
          total_bookings: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          whatsapp_number: string;
          total_bookings?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          whatsapp_number?: string;
          total_bookings?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "customers_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          }
        ];
      };
      bookings: {
        Row: {
          id: string;
          tenant_id: string;
          service_id: string;
          staff_id: string | null;
          customer_id: string | null;
          customer_name: string;
          customer_wa: string;
          booking_date: string;
          start_time: string;
          end_time: string;
          payment_status: PaymentStatus;
          proof_url: string | null;
          is_reminder_sent: boolean;
          reschedule_request: Json | null;
          is_no_show: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          service_id: string;
          staff_id?: string | null;
          customer_id?: string | null;
          customer_name: string;
          customer_wa: string;
          booking_date: string;
          start_time: string;
          end_time: string;
          payment_status?: PaymentStatus;
          proof_url?: string | null;
          is_reminder_sent?: boolean;
          reschedule_request?: Json | null;
          is_no_show?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          service_id?: string;
          staff_id?: string | null;
          customer_id?: string | null;
          customer_name?: string;
          customer_wa?: string;
          booking_date?: string;
          start_time?: string;
          end_time?: string;
          payment_status?: PaymentStatus;
          proof_url?: string | null;
          is_reminder_sent?: boolean;
          reschedule_request?: Json | null;
          is_no_show?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_staff_id_fkey";
            columns: ["staff_id"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      business_sector_enum: "beauty" | "space" | "auto" | "health";
      payment_status: PaymentStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tenant = Database["public"]["Tables"]["tenants"]["Row"];
export type Service = Database["public"]["Tables"]["services"]["Row"];
export type Staff = Database["public"]["Tables"]["staff"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type Portfolio = Database["public"]["Tables"]["portfolios"]["Row"];
export type TenantInsert = Database["public"]["Tables"]["tenants"]["Insert"];
export type ServiceInsert = Database["public"]["Tables"]["services"]["Insert"];
export type StaffInsert = Database["public"]["Tables"]["staff"]["Insert"];
export type BookingInsert = Database["public"]["Tables"]["bookings"]["Insert"];
export type CustomerInsert = Database["public"]["Tables"]["customers"]["Insert"];
export type PortfolioInsert = Database["public"]["Tables"]["portfolios"]["Insert"];
