import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

const DEMO_TENANT_ID = "d290f1ee-6c54-4b01-90e6-d701748f0851";

/**
 * Mengambil user yang sedang login. Di-memoize dengan React.cache() agar
 * dalam satu render pass server-side, Supabase hanya di-hit sekali
 * meski dipanggil dari layout dan page secara bersamaan.
 */
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * Mengembalikan tenantId — user.id jika login, atau DEMO_TENANT_ID jika tidak.
 * Juga di-memoize sehingga tidak ada round-trip ganda.
 */
export const getAuthTenantId = cache(async (): Promise<string> => {
  const user = await getAuthUser();
  return user?.id ?? DEMO_TENANT_ID;
});
