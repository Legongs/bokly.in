# AI AGENT RULES & CONVENTIONS: maubooking.in

## 1. PROJECT CONTEXT & PHILOSOPHY
- **Product**: `maubooking.in` — Micro-SaaS platform reservasi slot otomatis untuk UMKM jasa lokal (Nail Art, Barbershop, Salon, Studio Foto, Personal Trainer, dll).
- **Core Value**: Mobile-first, serba cepat, tanpa bloat, cegah *double-booking* & *no-show* via DP QRIS dan notifikasi Telegram instant.
- **Routing Strategy**: Subpath Multi-Tenant (`maubooking.in/[tenant]`) menggunakan Next.js App Router dynamic routes.
- **Development Style**: Vibe Coding with **Impeccable, Secure & Lightweight Standards** — Kode modular, bersih, simpel, efisien, fungsional penuh, berkinerja tinggi, dan terproteksi ketat dari celah keamanan.

---

## 2. TECH STACK & ARCHITECTURE
- **Framework**: Next.js (App Router, Server Actions/API Routes, TypeScript)
- **Styling**: Tailwind CSS + Shadcn UI / Lucide React Icons
- **Database & Auth**: Supabase (PostgreSQL, Supabase Auth, Row Level Security / RLS)
- **State & Data Fetching**: React State, Server Components, `@supabase/ssr`
- **Validation**: Zod Schema Validation
- **Hosting**: Vercel / Cloudflare DNS

---

## 3. DATABASE SCHEMA & RULES
Selalu patuhi skema dasar 3 tabel utama ini di Supabase:

1. `tenants`:
   - `id` (uuid, PK)
   - `slug` (text, unique, e.g. "salon-siska")
   - `business_name` (text)
   - `whatsapp_number` (text)
   - `telegram_chat_id` (text, nullable)
   - `qris_image_url` (text, nullable)
   - `is_active` (boolean, default true)
   - `created_at` (timestamp)

2. `services`:
   - `id` (uuid, PK)
   - `tenant_id` (uuid, FK -> tenants.id)
   - `name` (text)
   - `duration_minutes` (integer)
   - `price` (numeric)
   - `dp_amount` (numeric, default 0)

3. `bookings`:
   - `id` (uuid, PK)
   - `tenant_id` (uuid, FK -> tenants.id)
   - `service_id` (uuid, FK -> services.id)
   - `customer_name` (text)
   - `customer_wa` (text)
   - `booking_date` (date)
   - `start_time` (time)
   - `end_time` (time)
   - `payment_status` (enum: 'pending', 'approved', 'rejected')
   - `proof_url` (text, nullable)
   - `created_at` (timestamp)

---

## 4. IMPECCABLE CODE GENERATION GUIDELINES

### A. Anti-Spaghetti & Lightweight Architecture
- **KISS (Keep It Simple, Stupid)**: Tulis kode yang paling simpel, langsung pada intinya, dan efisien. DILARANG keras melakukan *over-engineering* atau membuat lapisan abstraksi yang tidak perlu.
- **Ringan & Berkinerja Tinggi**: Pastikan ukuran bundel kode minimal, hilangkan pustaka (library) yang tidak esensial, dan optimalkan render komponen React agar tidak terjadi *re-render* tak perlu.
- **Modular & Maintainable**: Pisahkan logika bisnis dan UI secara rapi. Hindari penumpukan logika kompleks dalam satu file tunggal (*monolithic/spaghetti code*).

### B. Strict Scope Constraint (Isolasi Perubahan)
- **Hanya Ubah yang Diperintahkan**: Saat menerima instruksi pengembangan/perbaikan, HANYA ubah file, komponen, atau fungsi yang berkaitan langsung dengan perintah tersebut.
- **Dilarang Merusak Kode Lain**: Dilarang mengubah, merestrukturisasi, atau meretas file/fitur di luar ruang lingkup perintah tanpa instruksi atau persetujuan eksplisit dari pengguna.

### C. Impeccable Engineering & Zero Stub
- **Zero Stub / Placeholder Policy**: Dilarang keras menyisakan `// TODO`, fungsi dummy, atau komponen setengah jadi. Setiap fungsi harus berjalan *end-to-end* secara sempurna.
- **Strict TypeScript**: Wajib mengaktifkan tipe data eksplisit (strict typing) untuk seluruh props, event handlers, API payloads, dan Supabase response types. Hindari penggunaan `any`.
- **Impeccable Error Handling**: Setiap proses asinkron (kueri Supabase, fetch API) harus memiliki blok `try-catch` terstruktur, *fallback UI*, serta *toast notification* yang aman tanpa mengekspos detail internal server/database kepada publik.

### D. Impeccable UI/UX & Design Polish
- **Pixel-Perfect & Responsive**: Tampilan harus responsif sempurna di perangkat seluler (Mobile-First) dengan tata letak, *padding*, *typography*, dan *touch target* yang nyaman untuk ibu jari.
- **Smooth Interaction & Motion**: Gunakan *micro-interactions*, indikator *loading/skeleton*, serta *disabled states* pada tombol untuk memberikan umpan balik langsung (instant feedback) saat tombol ditekan.
- **Customer Pages (`app/[tenant]/page.tsx`)**:
  - UI modern berbasis kartu (*Card-based UI*) dengan visual bersih dan kontras tinggi.
  - Pemilihan tanggal menggunakan *Horizontal Scroll Date Picker* yang intuitif.
  - Slot jam dihitung secara presisi (*real-time validation*) untuk mencegah *double-booking* pada detik yang sama.
- **Tenant Dashboard (`app/dashboard/page.tsx`)**:
  - Dashboard ringkas dengan tampilan *Timeline View* yang jernih.
  - Akses satu-klik untuk konfirmasi DP, pembatalan, dan pengubahan status operasional.

---

## 5. HIGH-LEVEL SECURITY STANDARDS (MANDATORY)

### A. Authentication, Authorization & Tenant Isolation
- **Middleware-Level Route Protection**: Halaman `/dashboard` dan rute internal wajib dilindungi melalui Next.js Middleware berbasis sesi Supabase Auth.
- **Multi-Tenant Data Isolation**: Setiap kueri, mutasi, atau Server Action WAJIB melakukan verifikasi kepemilikan data (`where tenant_id = current_user_tenant_id`). Dilarang mengandalkan input `tenant_id` mentah dari client tanpa validasi server.
- **Supabase RLS Enforcement**: Aktifkan Row Level Security (RLS) pada SELURUH tabel di Supabase. Kebijakan `SELECT`, `INSERT`, `UPDATE`, dan `DELETE` harus terdefinisi secara terpisah dan eksplisit.

### B. Input Validation & Sanitization
- **Strict Zod Schema Validation**: Semua payload dari Form, API Route, dan Server Action wajib divalidasi menggunakan skema Zod sebelum diproses oleh database atau logika bisnis.
- **Anti-XSS & HTML Sanitization**: Sanitasi seluruh input string dari user (`customer_name`, `notes`, dll) untuk mencegah serangan Injection atau Cross-Site Scripting (XSS).

### C. File Upload Security (Storage)
- **Strict File Type Validation**: Pengunggahan bukti transfer/QRIS hanya menerima ekstensi gambar resmi (`image/jpeg`, `image/png`, `image/webp`) dengan batas ukuran maksimal 2MB.
- **Randomized File Naming**: Jangan gunakan nama file asli dari user. Gunakan UUID v4 unik untuk setiap file yang diunggah (`uuidv4() + extension`).
- **Bucket Access Control**: Gunakan Supabase Storage Bucket yang dikonfigurasi dengan kebijakan RLS sesuai hak akses tenant.

### D. API & Webhook Security
- **Secret Signature Verification**: Semua Webhook dari Telegram, Payment Gateway, atau layanan eksternal WAJIB memverifikasi token rahasia / HMAC Signature header sebelum memproses data.
- **Rate Limiting**: Terapkan pembatasan laju pemanggilan (*rate limiting*) pada API pembuatan booking publik untuk mencegah serangan spamming/brute-force slot.
- **Environment Variable Hygiene**: Variabel rahasia (`SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`, dll) hanya boleh diakses di lingkungan Server Side (Server Components / Server Actions / API Routes). Jangan gunakan awalan `NEXT_PUBLIC_` untuk kredensial sensitif.

---

## 6. TOKEN EFFICIENCY & COMMUNICATION PROTOCOL (MANDATORY)

### A. To-The-Point & Zero Filler
- **Hemat Token & Langsung ke Hasil**: Dilarang menggunakan kalimat pembuka basa-basi, pengulangan prompt, atau penjelasan teori yang tidak diperlukan.
- **Direct Code Output**: Hasilkan kode secara langsung. Sertakan penjelasan atau catatan teknis HANYA pada bagian logika kompleks, arsitektur data, atau penanganan *edge cases* yang krusial.

### B. Proactive Approval & Clarification Protocol
- **Konfirmasi Hambatan Teknis**: Jika menemukan kendala logika, kerentanan, atau skenario ambigu saat membuat fitur, BERHENTI dan tanyakan klarifikasi/persetujuan user terlebih dahulu sebelum berasumsi sendiri.
- **Persetujuan Usulan/Saran**: Jika memiliki saran atau opsi perbaikan arsitektur yang melenceng dari instruksi awal, berikan 2–3 opsi ringkas (beserta kelebihan & kekurangannya) dan MINTA APPROVAL sebelum mengeksekusi kode.

---

## 7. WORKFLOW & COMMAND INSTRUCTIONS
Saat diminta membuat atau merestrukturisasi fitur:
1. **Analisis Impeccable & Keamanan**: Identifikasi arsitektur data, komponen terpengaruh, batasan *scope* instruksi, serta aspek keamanan (RLS, validasi Zod, dan otorisasi tenant).
2. **Klarifikasi & Approval (Jika Diperlukan)**: Jika terdapat hambatan, potensi efek samping pada kode lain, atau opsi alternatif arsitektur, ajukan pertanyaan ringkas untuk mendapatkan persetujuan user terlebih dahulu.
3. **Eksekusi Kode Simpel & Terisolasi**: Hasilkan kode yang simpel, efisien, terisolasi, dan lengkap tanpa terpotong (Komponen, Server Action, Tipe TypeScript, Skema Zod, dan Styling Tailwind) tanpa narasi berlebih.
4. **Validasi Kualitas**: Pastikan tidak ada bug visual, *race condition* pada slot jam, perubahan liar pada kode luar *scope*, maupun celah kebocoran data antartenant.

---

## 8. FOLDER STRUCTURE, STATE & ADVANCED DATABASE RULES

### A. Strict File Naming & Folder Conventions
- File/Folder Naming: Wajib menggunakan `kebab-case` (e.g., `date-slot-picker.tsx`, `use-booking.ts`).
- Folder Component Placement:
  - `components/ui/`: Komponen atomik/Shadcn.
  - `components/customer/`: Komponen khusus alur publik (`[tenant]`).
  - `components/dashboard/`: Komponen khusus dasbor tenant.
  - `lib/actions/`: Server Actions terpisah berdasarkan domain (`booking.actions.ts`, `tenant.actions.ts`).

### B. Race Condition & Atomic Slot Locking
- **Zero Double-Booking Guarantee**: Pengecekan slot jam wajib bersifat atomik. Gunakan Supabase Stored Procedure (RPC) / PostgreSQL Constraint untuk memvalidasi ketersediaan slot sebelum `INSERT` dilakukan, guna mencegah bentrokan booking di milidetik yang sama.

### C. Cache & Revalidation Standards
- Wajib memanggil `revalidatePath()` pada Server Action setelah melakukan transaksi mutasi data, agar UI publik (`/[tenant]`) dan UI dasbor (`/dashboard`) selalu sinkron secara real-time.

### D. Environment Hygiene
- Setiap penambahan variabel `process.env.*` baru wajib menyertakan pembaruan pada file `.env.example`.

---

## 9. SEO, AIO & GIO (DISCOVERABILITY STANDARDS)

### A. SEO (Search Engine Optimization)
- **Semantic HTML**: Wajib menggunakan tag HTML semantik (`<main>`, `<section>`, `<article>`, `<nav>`) agar struktur halaman mudah dibaca oleh *crawler* mesin pencari.
- **Dynamic Metadata & OpenGraph**: Setiap rute dinamis (`app/[tenant]/page.tsx`) WAJIB mengekspor `generateMetadata` untuk mengatur *Title*, *Description*, dan *OpenGraph Tags* secara spesifik menggunakan nama bisnis tenant.
- **Structured Data (JSON-LD)**: Implementasikan skema JSON-LD bawaan (`LocalBusiness` atau `Service`) di halaman publik agar Google memahami konteks lokasi, harga, dan jenis layanan bisnis tenant secara akurat.

### B. AIO & GIO (AI & Generative Engine Optimization)
- **Descriptive & Direct Structuring**: AI Search (Perplexity, ChatGPT Search, Google SGE) menyukai jawaban terstruktur. Pastikan rincian harga, layanan, dan jam buka dirender dalam format yang mudah diekstrak (seperti *list* atau tabel semantik HTML), bukan sekadar teks panjang yang bertumpuk.
- **Natural Language Context**: Gunakan penulisan deskriptif yang menjawab *intent* pelanggan, seolah menjawab pertanyaan langsung (contoh: "Daftar layanan dan harga di [Nama Bisnis]").

---

## 10. COPYWRITING & TONE OF VOICE

### A. Human-Friendly & Kasual (Santai tapi Profesional)
- **Anti-Kaku & Anti-Robot**: Dilarang keras menggunakan bahasa sistem yang kaku, birokratis, atau terlalu baku (misal: "Silakan melakukan input data", "Reservasi telah sukses dicatat", "Terjadi galat pada server").
- **Gaya Bahasa Percakapan (Conversational)**: Gunakan sapaan akrab, hangat, dan langsung pada intinya. 
  - *Buruk*: "Pilih waktu ketersediaan." -> *Baik*: "Pilih jadwal yang pas buat kamu."
  - *Buruk*: "Unggah bukti pembayaran." -> *Baik*: "Upload bukti transfer kamu di sini ya."
  - *Buruk*: "Terjadi kesalahan." -> *Baik*: "Waduh, slot ini baru aja diambil orang lain. Pilih jam yang lain yuk!"
- **Microcopy yang Berempati**: Saat terjadi *error* pada validasi form (Zod), berikan panduan yang menolong, bukan menyalahkan (misal: "Nomor WA sepertinya kurang pas, pastikan pakai awalan 628... ya").
- **Action-Oriented CTA**: Tombol aksi harus jelas dampaknya. Gunakan teks seperti "Kunci Slot Sekarang" atau "Simpan Jadwal", hindari kata generik seperti "Kirim" atau "Submit".

---

## 11. ANTI-AI VISUAL & ORGANIC DESIGN STANDARDS (UI/UX)

### A. Palet Warna Organik & Hangat
- **No Generic Dev-Tool Dark Mode**: Dilarang keras menggunakan tema hitam pekat dengan aksen neon (gaya Vercel/Linear) kecuali diminta khusus. Gunakan *Light Mode* dengan warna latar yang hangat (*warm white*, krem, atau abu-abu sangat muda) dan aksen membumi (hijau *sage*, terakota, biru pastel) yang cocok untuk UMKM gaya hidup.
- **Subtle Badges**: Hindari desain kapsul/badge (*eyebrow text*) dengan warna latar mencolok (merah/oranye) dan *border* tebal. Gunakan latar belakang pudar/lembut (misal: `bg-slate-50`) dengan teks warna netral (`text-slate-600`) agar menyatu natural dengan halaman.

### B. Ikonografi & Visual Aset
- **Ban the "Sparkle" Icon**: Dilarang menggunakan ikon *sparkles* (✨) untuk elemen penarik perhatian, karena ini adalah tanda paling kentara dari *template* AI generik. Gunakan ikon operasional dari Lucide yang spesifik (misal: `CalendarCheck`, `Store`, `Clock`, `Scissors`).
- **Real UI Mockups vs Generic Icons**: Daripada menampilkan ikon vektor raksasa di *landing page*, bangun *micro-UI* menggunakan komponen Tailwind asli (contoh: merender bentuk kotak kalender atau deretan tombol slot jam) untuk memperlihatkan wujud asli produk.

### C. Asimetri & Tata Letak (Layout)
- **Hentikan Perfect Symmetry**: AI selalu merender *Hero Section* dan teks rata tengah (*center-aligned*) secara monoton. Terapkan *asimetri terkendali*, seperti tata letak dua kolom (kiri teks utama, kanan *mockup* UI), untuk memberikan sentuhan desainer manusia sejati.
- **Soft Depth & Shadows**: Hindari efek *glow* neon atau garis tepi (*border*) kaku beralur tajam. Gunakan bayangan yang halus dan membaur (`shadow-sm`, `shadow-md` dengan opasitas rendah) untuk menciptakan kedalaman yang natural.