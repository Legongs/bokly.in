import { NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/lib/google-calendar";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");

  if (error) {
    console.error("Google Auth Callback Error:", error);
    return NextResponse.redirect(new URL("/dashboard/settings?error=google_auth_failed", request.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/dashboard/settings?error=missing_parameters", request.url));
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("google_oauth_state")?.value;

  if (!savedState || state !== savedState) {
    console.error("CSRF Validation Failed: State mismatch");
    return NextResponse.redirect(new URL("/dashboard/settings?error=invalid_state", request.url));
  }

  // Clear the state cookie now that it has been used
  cookieStore.delete("google_oauth_state");

  try {
    const tokens = await exchangeCodeForToken(code);
    const refreshToken = tokens.refresh_token;

    if (!refreshToken) {
      console.warn("No refresh token received. User might have connected previously. They need to revoke access in Google Account to generate a new refresh token.");
      return NextResponse.redirect(new URL("/dashboard/settings?error=no_refresh_token", request.url));
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/login?error=unauthorized", request.url));
    }

    // Update the google_refresh_token in tenants table
    // Assuming user.id corresponds to tenant.id in a 1-to-1 setup, or find the tenant
    const { error: updateError } = await supabase
      .from("tenants")
      .update({ google_refresh_token: refreshToken })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to save refresh token:", updateError.message);
      return NextResponse.redirect(new URL("/dashboard/settings?error=save_failed", request.url));
    }

    return NextResponse.redirect(new URL("/dashboard/settings?success=google_connected", request.url));
  } catch (err: any) {
    console.error("Exchange token error:", err.message);
    return NextResponse.redirect(new URL("/dashboard/settings?error=server_error", request.url));
  }
}
