import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { ShieldCheck, LogOut } from "lucide-react";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const superAdminEmail = process.env.SUPERADMIN_EMAIL;
  
  if (!superAdminEmail || user.email !== superAdminEmail) {
    // Jika bukan superadmin, lempar ke dashboard biasa
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans">
      <header className="bg-stone-900 text-white border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">Superadmin</span>
            <span className="text-stone-500 text-sm ml-2 px-2 py-0.5 rounded-full bg-stone-800 border border-stone-700">bukly.id</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-stone-400 hidden md:block">{user.email}</span>
            <Link 
              href="/dashboard"
              className="text-sm font-medium bg-stone-800 hover:bg-stone-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Keluar ke Dashboard
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
