# UI/UX & Visual Guidelines (bukly.id)

## 1. Anti-AI Visual Standards
Desain harus terasa organik dan dibuat oleh manusia (bukan *template* AI generik).
- **Larangan Warna Neon/Dark Mode Bawaan**: DILARANG menggunakan tema gelap kaku beraksen neon. Wajib gunakan warna-warna membumi/hangat (krem, putih tulang, hijau pastel, dsb) dengan bayangan (*shadows*) yang lembut untuk kesan *SaaS* jasa lokal.
- **Larangan Ikon "Sparkle" (✨)**: JANGAN PERNAH memakai ikon *sparkles* untuk elemen penarik perhatian. Gunakan ikon yang relevan dengan ranah layanan UMKM dari Lucide React (misalnya ikon `Clock`, `Scissors`, `Coffee`, dsb).
- **Asimetri Terkendali**: Hentikan tata letak (*layout*) yang monoton, rata-tengah sepenuhnya (perfect symmetry). Terapkan tata letak asimetris (misal: dua kolom, teks di kiri dan gambar di kanan).

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
