import { createClient } from "@/lib/supabase/server";

export async function getGoogleOAuthUrl(state: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error("Google OAuth credentials are not configured.");
  }

  const scope = "https://www.googleapis.com/auth/calendar.readonly";
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;

  return authUrl;
}

export async function exchangeCodeForToken(code: string) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Google OAuth credentials are not configured.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Google Token Error:", text);
    throw new Error("Failed to exchange token with Google.");
  }

  return response.json(); // { access_token, refresh_token, expires_in, scope, token_type }
}

export async function getAccessTokenFromRefreshToken(refreshToken: string) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials are not configured.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh Google Access Token.");
  }

  const data = await response.json();
  return data.access_token;
}

export async function getBusySlotsFromGoogle(refreshToken: string, dateStr: string) {
  try {
    const accessToken = await getAccessTokenFromRefreshToken(refreshToken);
    
    // dateStr is 'YYYY-MM-DD'
    const timeMin = new Date(`${dateStr}T00:00:00Z`).toISOString();
    const timeMax = new Date(`${dateStr}T23:59:59Z`).toISOString();

    const response = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timeMin,
        timeMax,
        items: [{ id: "primary" }],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch freeBusy from Google Calendar.");
    }

    const data = await response.json();
    const busyArray = data.calendars?.primary?.busy || [];

    // Map ke format slot buklyid (e.g., start_time, end_time)
    const busySlots = busyArray.map((b: any) => {
      const start = new Date(b.start);
      const end = new Date(b.end);
      
      const startH = String(start.getHours()).padStart(2, '0');
      const startM = String(start.getMinutes()).padStart(2, '0');
      
      const endH = String(end.getHours()).padStart(2, '0');
      const endM = String(end.getMinutes()).padStart(2, '0');

      return {
        start_time: `${startH}:${startM}`,
        end_time: `${endH}:${endM}`,
        buffer_minutes: 0,
        staff_id: null
      };
    });

    return busySlots;
  } catch (error) {
    console.error("Error fetching Google Calendar busy slots:", error);
    return []; // Return empty if failed so it doesn't break booking flow
  }
}
