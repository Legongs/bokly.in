import React from "react";
import type { Metadata } from "next";
import LoginPageClient from "./page.client";

export const metadata: Metadata = {
  title: "Masuk ke Dasbor | bukly.in",
  description: "Masuk ke akun tenant Anda untuk mengelola jadwal reservasi.",
};

export default function LoginPage() {
  return <LoginPageClient />;
}
