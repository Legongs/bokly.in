import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { ShieldCheck, LogOut } from "lucide-react";
import { Logo } from "@/components/ui/logo";

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
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center" aria-label="Beranda bukly.id">
              <Logo variant="dark" className="text-xl" />
            </Link>
            <span className="text-indigo-400 font-semibold text-xs px-2.5 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-800/60 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Superadmin
            </span>
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
