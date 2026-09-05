# Panduan Sistem Pembayaran & Halaman Status Transaksi (bukly.id)

Dokumen ini adalah panduan lengkap arsitektur sistem pembayaran, halaman konfirmasi transaksi berhasil & gagal, serta integrasi gateway Midtrans untuk platform **bukly.id**.

---

## 1. Daftar Rute Halaman & URL

Berikut adalah rute resmi untuk status pembayaran yang dapat diakses langsung oleh pengguna maupun sebagai tujuan *redirect* dari Midtrans:

| Nama Halaman | Rute Utama | Rute Alias (Dashboard) | Kegunaan |
| :--- | :--- | :--- | :--- |
| **Pembayaran Berhasil** | `/payment/success` | `/dashboard/billing/success` | Menampilkan struk pembayaran sukses, rincian langganan aktif, tombol cetak bukti, dan navigasi ke dashboard. |
| **Menunggu Pembayaran** | `/payment/success?status=pending` | `/dashboard/billing/success?status=pending` | Tampilan status kuning (*amber*) bagi metode transfer bank / e-wallet yang membutuhkan aksi pengguna. |
| **Pembayaran Gagal** | `/payment/failed` | `/dashboard/billing/failed` | Menampilkan penjelasan berempati atas kendala transaksi, solusi cepat, tombol coba lagi, dan bantuan WhatsApp CS. |

### Parameter URL (Query Params) yang Didukung:
- `order_id`: ID referensi transaksi (contoh: `buklyid-pro-847291`). Tampil di kartu struk dan dilengkapi fitur *Salin (Copy)* 1-klik.
- `status` / `transaction_status`:
  - `settlement` atau `capture` $\rightarrow$ Sukses penuh (*Emerald*).
  - `pending` $\rightarrow$ Menunggu verifikasi (*Amber*).
- `reason` / `status_message`: Pesan kendala yang dikirimkan oleh gateway atau sistem (misal: "Batas Waktu Habis", "Dibatalkan Pengguna").

---

## 2. Alur Pembayaran Lengkap (Payment Flow)

```
[Tenant di /dashboard/billing]
         │
         ▼ (Klik "Upgrade Paket")
[lib/actions/billing.actions.ts: createBillingIntent]
         │
         ├─► Baca konfigurasi Midtrans dinamis dari Supabase (`app_settings.midtrans_config`)
         ├─► Validasi kupon/voucher diskon (jika ada)
         ├─► Buat sesi transaksi ke Midtrans Snap API
         │
         ▼
[Frontend: window.snap.pay(snapToken)]
         │
         ├─► Sukses (Popup) ──────► Redirect ke `/payment/success?order_id=...`
         ├─► Pending (Popup) ─────► Redirect ke `/payment/success?status=pending&order_id=...`
         ├─► Gagal (Popup) ───────► Redirect ke `/payment/failed?order_id=...`
         │
         └─► Redirect Callback (3DS/Mobile):
               • finish  : https://bukly.id/payment/success
               • pending : https://bukly.id/payment/success?status=pending
               • error   : https://bukly.id/payment/failed
```

---

## 3. Webhook & Verifikasi Backend Otomatis

Midtrans mengirimkan notifikasi *asynchronous* (HTTP POST) setiap kali status pembayaran berubah:

- **Endpoint Webhook**: `/api/billing/webhook` (`app/api/billing/webhook/route.ts`)
- **Fungsi Pemroses**: `handleMidtransWebhook` di `lib/actions/billing.actions.ts`
- **Tindakan Sistem**:
  - `settlement` / `capture`:
    1. Mengubah status `billing_intents` menjadi `settled`.
    2. Memperbarui tabel `subscriptions` tenant: memperpanjang masa aktif (`current_period_end`) dan mengubah plan (`pro` atau `bisnis`).
    3. Mengurangi sisa kuota voucher promo (jika digunakan).
  - `deny` / `cancel` / `expire` / `failure`:
    - Mengubah status `billing_intents` menjadi `failed`.

---

## 4. Kepatuhan Standar Desain UI/UX (`docs/ui_ux.md`)

Kedua halaman status transaksi dibangun dengan mematuhi aturan baku desain bukly.id:
1. **Warna Semantik**:
   - Sukses: Token `emerald-700` (`#0f8a5f`) dengan latar lembut `bg-emerald-50` dan border `border-emerald-200`.
   - Pending: Token `amber-700` (`#c2720f`) dengan ikon animasi detak lembut (*pulse*).
   - Gagal: Token `rose-600` dengan latar `bg-rose-50` dan border `border-rose-200`.
   - Tombol Aksi Utama: Token resmi `indigo-700` (`#4338ca`) dengan hover `indigo-800` (`#332c9e`).
2. **Anti-AI Visual**: Tidak menggunakan ikon *sparkle* generik (✨), melainkan ikon fungsional yang relevan (`CheckCircle2`, `Clock`, `AlertTriangle`, `Printer`, `Copy`).
3. **Copywriting Berempati**:
   - Halaman Gagal menegaskan: *"Tenang, saldo kamu aman dan tidak terpotong"* untuk menenangkan kecemasan pengguna UMKM.
4. **Fitur Pendukung Transaksi**:
   - Tombol **Cetak Bukti Pembayaran** (`window.print()` dengan optimasi CSS `@media print`).
   - Tombol **Hubungi Bantuan WhatsApp** yang otomatis menyertakan Nomor Order ID di dalam template pesan chat.

---

## 5. Cara Pengujian Lokal (Testing Manual)

Untuk memverifikasi tampilan kedua halaman secara langsung di browser lokal (`npm run dev` pada `http://localhost:3000`):

1. **Tes Transaksi Berhasil (Lunas)**:
   ```
   http://localhost:3000/payment/success?order_id=buklyid-pro-847291
   ```
2. **Tes Menunggu Pembayaran (Pending VA / QRIS)**:
   ```
   http://localhost:3000/payment/success?status=pending&order_id=buklyid-va-552190
   ```
3. **Tes Transaksi Gagal / Dibatalkan**:
   ```
   http://localhost:3000/payment/failed?order_id=buklyid-pro-847291&reason=Batas%20Waktu%20Habis
   ```
4. **Tes Rute Alias Dashboard**:
   ```
   http://localhost:3000/dashboard/billing/success?order_id=buklyid-pro-847291
   http://localhost:3000/dashboard/billing/failed?order_id=buklyid-pro-847291
   ```
