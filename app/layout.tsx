import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://bukly.in'),
  title: {
    default: "bukly.in | Aplikasi Reservasi Online UMKM Indonesia",
    template: "%s | bukly.in",
  },
  description: "Aplikasi booking jadwal dan reservasi online gratis untuk Barbershop, Salon, Klinik, dan Jasa UMKM lainnya. Biarkan pelanggan atur jadwal sendiri 24/7.",
  keywords: ["aplikasi booking", "reservasi online", "jadwal salon", "booking barbershop", "sistem reservasi", "aplikasi umkm"],
  authors: [{ name: "bukly.in" }],
  creator: "bukly.in",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://bukly.in",
    title: "bukly.in | Aplikasi Reservasi Online UMKM",
    description: "Tinggalkan cara lama. Bikin web reservasi otomatis untuk usahamu dalam 1 menit. Cocok untuk Salon, Barbershop, Klinik, dan Bengkel.",
    siteName: "bukly.in",
  },
  twitter: {
    card: "summary_large_image",
    title: "bukly.in | Bikin Web Booking Otomatis",
    description: "Bikin halaman reservasi usahamu sendiri dalam 1 menit. Tanpa ribet balas chat satu-satu.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
