import { NextResponse } from "next/server";
import { getGoogleOAuthUrl } from "@/lib/google-calendar";

export async function GET() {
  try {
    const authUrl = await getGoogleOAuthUrl();
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error("Google Auth Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
