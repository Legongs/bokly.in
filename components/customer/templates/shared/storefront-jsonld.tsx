import React from "react";
import type { Tenant, Service } from "@/types/database.types";

export interface StorefrontJsonLdProps {
  tenant: Tenant;
  services?: Service[];
  schemaType: "AutoRepair" | "HealthAndBeautyBusiness" | "BeautySalon" | "MedicalClinic" | "LocalBusiness";
}

export function StorefrontJsonLd({ tenant, schemaType, services }: StorefrontJsonLdProps) {
  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: tenant.business_name,
    telephone: tenant.whatsapp_number,
    url: `https://bukly.id/${tenant.slug}`,
  };

  if (services && services.length > 0) {
    jsonLd.makesOffer = services.map((s) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: s.name,
      },
      price: s.price,
      priceCurrency: "IDR",
    }));
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
