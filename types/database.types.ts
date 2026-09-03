export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PaymentStatus = "pending" | "approved" | "rejected";

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
          open_time: string;
          close_time: string;
          payment_method_type: string;
          payment_gateway_provider: string | null;
          payment_gateway_server_key: string | null;
          payment_gateway_client_key: string | null;
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
          open_time?: string;
          close_time?: string;
          payment_method_type?: string;
          payment_gateway_provider?: string | null;
          payment_gateway_server_key?: string | null;
          payment_gateway_client_key?: string | null;
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
          open_time?: string;
          close_time?: string;
          payment_method_type?: string;
          payment_gateway_provider?: string | null;
          payment_gateway_server_key?: string | null;
          payment_gateway_client_key?: string | null;
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
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          duration_minutes: number;
          buffer_minutes?: number;
          price: number;
          dp_amount?: number;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          duration_minutes?: number;
          buffer_minutes?: number;
          price?: number;
          dp_amount?: number;
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
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
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
export type TenantInsert = Database["public"]["Tables"]["tenants"]["Insert"];
export type ServiceInsert = Database["public"]["Tables"]["services"]["Insert"];
export type StaffInsert = Database["public"]["Tables"]["staff"]["Insert"];
export type BookingInsert = Database["public"]["Tables"]["bookings"]["Insert"];
export type CustomerInsert = Database["public"]["Tables"]["customers"]["Insert"];
