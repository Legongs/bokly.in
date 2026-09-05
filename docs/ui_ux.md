# UI/UX & Visual Guidelines (bukly.id)

## 0. Ruang Lingkup Identitas Warna (PENTING)
Ada DUA sistem warna terpisah di platform ini — jangan sampai tertukar:

1. **Identitas brand Bukly** (bagian 1 di bawah): berlaku untuk landing page, halaman register/login, seluruh dashboard admin (`/dashboard`), dan komponen `<Logo />`. Semua permukaan ini WAJIB memakai palet indigo di bawah.
2. **Tema storefront tenant** (`components/customer/templates/*`): berlaku untuk halaman booking publik milik masing-masing tenant (demo-salon, demo-barbershop, dst). Ini TETAP memakai sistem `theme_color` per tenant (rose/teal/violet/orange/blue) yang sudah ada — JANGAN diubah ke indigo. Setiap tenant berhak tampil dengan identitas visual bisnis mereka sendiri.

## 1. Sistem Warna Brand (Anti-AI Visual Standards)
Desain harus terasa organik dan dibuat oleh manusia (bukan *template* AI generik), sambil tetap konsisten dengan identitas indigo baru.

**Token warna wajib** (gunakan variabel terpusat, jangan hardcode hex berulang):

| Token | Hex | Kelas Tailwind terdekat | Kegunaan |
|---|---|---|---|
| ink | `#14131f` | `text-stone-900` | Teks utama/headline |
| ink-soft | `#5c5b6b` | `text-stone-500` | Teks pendukung |
| paper | `#f7f7fb` | `bg-slate-50` | Background halaman |
| line | `#e4e3ee` | `border-slate-200` | Border/divider tipis |
| indigo | `#4338ca` | `bg-indigo-700` | Aksi utama, tombol, link, logo `.id` |
| indigo-dark | `#332c9e` | `bg-indigo-800` | Hover state |
| indigo-deep | `#1e1b4b` | `bg-indigo-950` | Section gelap (CTA penutup, panel promo login) |
| indigo-tint | `#eceafd` | `bg-indigo-50` | Background badge/pill, highlight lembut |
| amber | `#c2720f` | `text-amber-700` | Status "perlu perhatian" |
| emerald | `#0f8a5f` | `text-emerald-700` | Status "berhasil/selesai" |

- **Larangan Neon**: DILARANG memakai aksen neon (hijau/pink terang menyala) di manapun. Palet di atas sudah cukup kaya tanpa neon.
- **Section gelap diperbolehkan, tapi terbatas**: `indigo-deep` HANYA dipakai untuk 1-2 section penekanan per halaman (misal CTA penutup landing page, panel kanan halaman login) — bukan sebagai tema gelap keseluruhan aplikasi. Ini bukan "dark mode kaku bawaan AI" karena warnanya adalah bagian sengaja dari identitas brand, bukan default template gelap generik.
- **Larangan Ikon "Sparkle" (✨)**: JANGAN PERNAH memakai ikon *sparkles* untuk elemen penarik perhatian. Gunakan ikon yang relevan dengan ranah layanan (dari Lucide React atau Tabler), misalnya `Clock`, `Scissors`, `Coffee`, `Calendar`.
- **Asimetri Terkendali**: Hentikan tata letak (*layout*) yang monoton, rata-tengah sepenuhnya (perfect symmetry). Terapkan tata letak asimetris (misal: dua kolom, teks di kiri dan gambar di kanan).
- **Konsistensi status semantik**: badge status yang bermakna sama harus pakai warna yang sama di seluruh aplikasi — misal "Pending" dan "Perlu Dicek" HARUS sama-sama pakai token `amber`, jangan salah satu pakai hitam/netral.

## 2. Praktik Terbaik Interaksi & Transisi
- **Smooth Transition**: Wajib menerapkan kelas transisi yang halus (contoh: `transition-all duration-200`) pada komponen *hoverable* (tombol, *input* form, kartu).
- **Loading State & Feedback**: Setiap kali terdapat operasi asinkron (mis. form register, pencarian), antarmuka wajib menunjukkan indikator *loading* (*spinner* atau menonaktifkan tombol dengan *disabled state*), dan menampilkan pemberitahuan (*toast*) umpan balik atas keberhasilan/kegagalan aksi.
- **Pola RORO (UI Utilities)**: Untuk fungsi bantuan UI (mis. *formatter*, *state-reducers*), terapkan penerimaan argumen *Object* dan pengembalian *Object* (Receive an Object, Return an Object) agar rapi.

## 3. Strict Mobile-First Layout
Desain harus sempurna saat diakses dari ponsel layar sentuh ibu jari-sentris (*thumb-centric*).
- **Horizontal Lists**: Setiap daftar horizontal (seperti pemilihan jam jadwal, deretan kategori layanan) WAJIB menggunakan utilitas `overflow-x-auto scrollbar-hide` untuk menjamin navigasi geser ke samping tanpa gangguan bilah gulir (*scrollbar*).
- **Bottom Navigation**: Bilah navigasi bawah (*Bottom Navigation*) hanya diizinkan memiliki maksimal 5 item menu. Teks label pada menu bawah ini WAJIB disembunyikan di layar kecil menggunakan utilitas `hidden md:block` (di *mobile* hanya ikon yang terlihat, label muncul di *desktop*).

## 4. Panduan Copywriting (Salinan Teks)
- **Kasual & Berempati**: Dilarang menggunakan bahasa sistem kaku atau seperti robot. Gunakan sapaan akrab. (Contoh: "Waduh, slot ini sudah diambil, cari yang lain yuk!" BUKAN "Galat: Slot tidak tersedia").
- **Proaktif pada Validasi Form**: Peringatan (*error message*) pada validasi form Zod harus memandu, bukan menyalahkan (contoh: "Nomor WhatsApp kurang lengkap nih, pastikan pakai kode negara +62 ya").
- **Action-Oriented CTA**: Gunakan teks aksi panggilan (*Call To Action*) yang mengisyaratkan dampak spesifik (mis. "Amankan Slot Sekarang", "Simpan Jadwal"), bukan teks generik hambar seperti "Submit" atau "Kirim".

## 5. Implementasi Teknis Warna (Tailwind)
- Setiap class Tailwind yang mengandung warna WAJIB berupa string statis dan lengkap (contoh: `bg-indigo-700`), TIDAK BOLEH dibangun secara dinamis lewat template literal/concatenation (contoh yang SALAH: `` `bg-${color}-700` ``) — Tailwind JIT compiler tidak bisa mendeteksi class yang dibangun seperti itu, sehingga stylingnya akan hilang saat production build.
- Untuk komponen yang butuh warna dinamis (misal storefront tenant dengan `theme_color` custom), WAJIB pakai object map eksplisit yang mendaftarkan setiap kombinasi warna secara lengkap dan statis.