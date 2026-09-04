import { NextResponse } from "next/server";
import { getGoogleOAuthUrl } from "@/lib/google-calendar";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export async function GET() {
  try {
    const state = randomUUID();
    const cookieStore = await cookies();
    cookieStore.set("google_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    });

    const authUrl = await getGoogleOAuthUrl(state);
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error("Google Auth Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
