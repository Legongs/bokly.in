import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/login?error=unauthorized", request.url));
    }

    // Remove the google_refresh_token in tenants table
    const { error: updateError } = await supabase
      .from("tenants")
      .update({ google_refresh_token: null })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to remove refresh token:", updateError.message);
      return NextResponse.redirect(new URL("/dashboard/settings?error=disconnect_failed", request.url));
    }

    return NextResponse.redirect(new URL("/dashboard/settings?success=google_disconnected", request.url));
  } catch (err: any) {
    console.error("Disconnect error:", err.message);
    return NextResponse.redirect(new URL("/dashboard/settings?error=server_error", request.url));
  }
}
