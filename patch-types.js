const fs = require('fs');
let content = fs.readFileSync('types/database.types.ts', 'utf8');

const promotions = `
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
          }
        ]
      },`;

const testimonials = `
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
          }
        ]
      },`;

const push_subscriptions = `
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
          }
        ]
      }`;

if (!content.includes('promotions: {')) {
  // Replace the exact closing of the last table to insert our new tables BEFORE the `Tables` object closes.
  content = content.replace(/(      };\r?\n)(    };\r?\n    Views: {)/, '$1' + promotions + '\n' + testimonials + '\n' + push_subscriptions + '\n$2');
}

content = content.replace(/theme_color: string \| null/g, 'theme_color: string | null\n          updated_at: string');
content = content.replace(/theme_color\?: string \| null/g, 'theme_color?: string | null\n          updated_at?: string');

content = content.replace(/is_reminder_sent: boolean/g, 'is_reminder_sent: boolean\n          reminder_h1_sent: boolean\n          reminder_h2_sent: boolean\n          reminder_h3_sent: boolean');
content = content.replace(/is_reminder_sent\?: boolean/g, 'is_reminder_sent?: boolean\n          reminder_h1_sent?: boolean\n          reminder_h2_sent?: boolean\n          reminder_h3_sent?: boolean');

content = content.replace(/midtrans_token\?: string \| null;\r?\n          created_at\?: string;/g, 'midtrans_token?: string | null;\n          voucher_id?: string | null;\n          created_at?: string;');

const exportsCode = `
export type Promotion = Database["public"]["Tables"]["promotions"]["Row"];
export type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];
`;

if (!content.includes('export type Promotion')) {
  content += exportsCode;
}

fs.writeFileSync('types/database.types.ts', content);
