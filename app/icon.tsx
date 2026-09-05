import { ImageResponse } from "next/og";

// Next.js App Router: file ini secara otomatis menjadi favicon
// Ukuran 64x64 — browser akan scale down ke 32x32/16x16 secara otomatis
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        {/* Wordmark: "bukly" stone-900 + ".id" indigo-700 — sesuai logo_design.md */}
        <div
          style={{
            display: "flex",
            fontSize: 20,
            fontWeight: 900,
            letterSpacing: "-0.05em",
            fontFamily: "sans-serif",
          }}
        >
          <span style={{ color: "#14131f" }}>b</span>
          <span style={{ color: "#4338ca" }}>.id</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
