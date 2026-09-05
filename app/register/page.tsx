import React from "react";
import type { Metadata } from "next";
import RegisterPageClient from "./page.client";

export const metadata: Metadata = {
  title: "Daftar Tenant Baru | bukly.in",
  description: "Buat web booking otomatis untuk bisnis Anda dalam hitungan detik bersama bukly.in.",
};

export default function RegisterPage() {
  return <RegisterPageClient />;
}
