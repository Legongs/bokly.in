import { createAdminClient } from "@/lib/supabase/server";

export interface MidtransConfig {
  serverKey: string;
  clientKey: string;
  isProduction: boolean;
}

const DEFAULT_CONFIG: MidtransConfig = {
  serverKey: "",
  clientKey: "",
  isProduction: false,
};

export async function getMidtransConfig(): Promise<MidtransConfig> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("id", "midtrans_config")
    .single();

  if (error || !data) {
    return DEFAULT_CONFIG;
  }

  return data.value as unknown as MidtransConfig;
}
