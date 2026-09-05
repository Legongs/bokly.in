import type { Tenant, Service, Staff, Portfolio } from "@/types/database.types";
import type { BusinessDictionary } from "@/lib/dictionaries";

export interface StorefrontTemplateProps {
  tenant: Tenant;
  services: Service[];
  staffList: Staff[];
  portfolios: Portfolio[];
  dictionary: BusinessDictionary;
}
