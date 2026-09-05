import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://bukly.id";

  // Rute statis
  const staticRoutes = [
    "",
    "/artikel",
    "/artikel/1-cara-meningkatkan-pelanggan-salon",
    "/artikel/2-pentingnya-sistem-booking-barbershop",
    "/artikel/3-menghindari-pelanggan-no-show",
    "/login",
    "/register",
    "/privacy",
    "/terms",
    "/contact",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  try {
    // Rute dinamis untuk Tenant
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return staticRoutes;
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
    const { data: tenants } = await supabase
      .from("tenants")
      .select("slug, updated_at")
      .eq("is_active", true);

    const tenantRoutes = (tenants || []).map((tenant) => ({
      url: `${baseUrl}/${tenant.slug}`,
      lastModified: new Date(tenant.updated_at || new Date()),
      changeFrequency: "daily" as const,
      priority: 0.9,
    }));

    return [...staticRoutes, ...tenantRoutes];
  } catch (error) {
    return staticRoutes;
  }
}
