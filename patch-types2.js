const fs = require('fs');
let content = fs.readFileSync('types/database.types.ts', 'utf8');

const tenantFacilities = `
      tenant_facilities: {
        Row: {
          id: string;
          tenant_id: string;
          facility_type: string;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        }
        Insert: {
          id?: string;
          tenant_id: string;
          facility_type: string;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        }
        Update: {
          id?: string;
          tenant_id?: string;
          facility_type?: string;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        }
        Relationships: [
          {
            foreignKeyName: "tenant_facilities_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      };`;

if (!content.includes('tenant_facilities: {')) {
  content = content.replace(/(      };\r?\n)(    };\r?\n    Views: {)/, '$1' + tenantFacilities + '\n$2');
}

// Add fields to services
const servicesMetaFields = `
          specialty_tag: string | null;
          is_female_only: boolean;
          service_category: string;`;
const servicesMetaFieldsOptional = `
          specialty_tag?: string | null;
          is_female_only?: boolean;
          service_category?: string;`;

if (!content.includes('specialty_tag: string | null;')) {
  // services Row
  content = content.replace(/duration_minutes: number;\r?\n          buffer_minutes: number;/g, 'duration_minutes: number;\n          buffer_minutes: number;' + servicesMetaFields);
  
  // services Insert
  content = content.replace(/duration_minutes: number;\r?\n          buffer_minutes\?: number;/g, 'duration_minutes: number;\n          buffer_minutes?: number;' + servicesMetaFieldsOptional);
  
  // services Update
  content = content.replace(/duration_minutes\?: number;\r?\n          buffer_minutes\?: number;/g, 'duration_minutes?: number;\n          buffer_minutes?: number;' + servicesMetaFieldsOptional);
}

fs.writeFileSync('types/database.types.ts', content);
