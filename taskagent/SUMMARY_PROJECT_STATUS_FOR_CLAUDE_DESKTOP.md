# bukly.id Rebuild Foundation — Project Summary

**Project Owner:** Kamu (founder bukly.id)  
**Current Date:** 6 Sep 2026  
**Status:** Prompt A COMPLETE ✅ | Ready for Prompt B  
**Tech Stack:** Next.js 16 + React 19 + Supabase + TypeScript + Tailwind CSS v4

---

## Context & Scope

Rebuild booking engine foundation + subscription features + automation.

**Why:** Platform belum launching, no real tenants yet = safe to romb system foundation sekarang. Setelah launch, ini jadi 10x lebih susah.

**What:** 5 major areas to rebuild (Prompt A-E), each with separate SQL migrations + TS logic + UI components.

---

## PROMPT A — Booking Engine Foundation ✅ SELESAI

### Status: DONE + BUILD VERIFIED (Exit Code 0)

**What Changed:**
1. **Anti-Clash Database** — from point-time check → range-overlap check via PostgreSQL exclusion constraint
   - File: `supabase/migrations/00013_booking_range_conflict.sql`
   - Jaminan: Tidak ada 2 booking bisa overlap di staff/resource yang sama (enforced di DB level)

2. **Multi-Service per Booking** — 1 booking bisa punya 2+ layanan sekaligus (perlu buat salon/beauty)
   - File: `supabase/migrations/00014_booking_items.sql`
   - Transactional: booking + booking_items atomik di RPC PostgreSQL (bukan insert terpisah)

3. **Sector-Specific Fields** — Auto (vehicle brand/type/plate/complaint) + Health (consultation type: baru/lanjutan)
   - Validated conditional di Zod schema (required hanya untuk sektor yang terkait)

4. **Flexible Duration** — untuk sektor Space/sewa ruang (customer pilih durasi custom, harga = price_per_hour × durasi)
   - File: `supabase/migrations/00015_flexible_duration_services.sql`

**Key Decisions Made:**
- `completed` status tetap memblokir slot (hanya `rejected` yang dikecualikan)
- Tidak ada validasi staff capability per-service (MVP: tenant tahu sendiri staff mereka bisa apa)
- DP amount multi-service = jumlah DP semua layanan (bukan persentase)
- `booking_items` transaksional di RPC (jika gagal, booking juga rollback otomatis)
- `service.price` untuk flexible duration = harga per jam
- **KNOWN LIMITATION:** Tidak support overnight booking (21:00 → 01:00 esok hari) — future fix tersedia di walkthrough

**Files Modified/Created:**
- New migrations: 00013, 00014, 00015
- Updated: `types/database.types.ts`, `lib/actions/booking.actions.ts`, `lib/actions/service.actions.ts`, `hooks/use-booking-flow.ts`
- Updated UI: `step-service-select.tsx`, `step-customer-form.tsx`, `step-date-time.tsx`, `service-form.tsx`, `booking-flow.tsx`

**Error Handling Verified:**
- Database constraint violation (23P01) → caught at RPC level → translated to "UNIQUE_SLOT_VIOLATION"
- TypeScript checks for "UNIQUE_SLOT_VIOLATION" → displays friendly msg to customer ("Waduh, slot ini baru aja diambil orang lain...")
- ✅ Full chain verified with actual code

**Build Status:**
- `npm run build` — Exit Code 0 ✅
- TypeScript: 0 errors, ESLint: 0 errors
- Static pages: 38/38 generated successfully

**Next Step for Prompt A:** Manual testing (at least test #1 booking normal + #3 anti-clash), then `git push`

---

## PROMPT B — Dynamic Feature Flags & Fonnte Global Config ⏳ READY

**What It Does:**
1. Move feature limits (bookings/month, staff count, etc.) from hardcoded `PLAN_LIMITS` → database `app_settings`
   - Developer (kamu) bisa ubah fitur apa aja per paket (Gratis/Pro/Bisnis) lewat superadmin, tanpa redeploy

2. Konfigurasi Fonnte Global (milik developer/kamu) terpisah dari tenant's `wa_api_key`
   - Dipakai khusus untuk reminder otomatis WA + notif booking baru ke tenant (berbayar feature untuk Pro/Bisnis)
   - Developer yang tanggung biaya kirim WA, bukan tenant

3. Superadmin panel buat atur keduanya (feature matrix + WA config)

**Files Involved:** lib/global-wa.ts, lib/subscription.ts (update), lib/actions/superadmin.actions.ts, UI superadmin tab baru

---

## PROMPT C — Automated WA Notifications ⏳ READY

**What It Does:**
1. Reminder otomatis ke customer H-1, H-2, H-3 sebelum booking (cron job tiap hari)
2. Notif ke tenant saat ada booking baru masuk (fire-and-forget di background saat submitBooking())
3. Pakai kredensial Fonnte global (dari Prompt B)
4. Hanya nyala untuk paket Pro/Bisnis (cek via `canUseAutoWaFeature()`)

**Files Involved:** lib/actions/auto-notification.actions.ts, app/api/cron/send-booking-reminders/route.ts, vercel.json (add cron schedule)

**Dependency:** Must do Prompt B first (need getGlobalFonnteConfig() + feature flags ready)

---

## PROMPT D — PWA + Push Notifications ⏳ READY

**What It Does:**
1. Dashboard & Storefront installable sebagai PWA (seperti aplikasi native)
2. Push notifications ke browser/device saat ada event (landing, booking baru, status update)
3. Teknologi Web Push (GRATIS, tidak butuh WhatsApp/Fonnte)
4. Available untuk SEMUA tenant termasuk Gratis (bukan gated feature)

**Files Involved:** Service worker, manifest files, push subscription DB table, components/pwa/ folder, lib/actions/push-notification.actions.ts

**Note:** Independent dari Prompt B/C, bisa dikerjakan kapan aja

---

## PROMPT E — Pricing Cards di Landing Page ⏳ READY

**What It Does:**
1. Display harga per paket (Gratis/Pro/Bisnis) di landing page publik
2. Reuse existing pricing-cards.tsx component dari dashboard
3. Data harga **dinamis** dari getDynamicPricing() (bukan hardcode)
   - Kalau developer ubah harga di superadmin → landing page otomatis update

**Files Involved:** components/landing/pricing-section.tsx, update app/page.tsx (landing)

**Note:** Independent, paling cepat dikerjain (< 1 jam)

---

## Execution Order (Wajib Ini Urutan)

```
✅ A (SELESAI)
    ↓
⏳ B (wajib sebelum C)
    ↓
⏳ C (butuh B)

⏳ D (independen, bisa kapan aja setelah A)
⏳ E (independen, bisa kapan aja setelah A, paling cepat)
```

---

## Current Blockers / Next Steps

### Immediate (Hari Ini/Besok):
1. ✅ Test manual Prompt A (test #1 + #3 minimal)
2. ✅ `git push` Prompt A ke repo
3. ⏳ Copy-paste PROMPT_B_DYNAMIC_FEATURE_FLAGS_SUPERADMIN.md ke Antigravity (atau Gemini 3.1 Pro)

### Then:
- Prompt B → review → execute
- Prompt C → review → execute
- Parallel: Prompt D + E bisa dikerjain sambil nunggu Prompt B/C execution

---

## Key Files Reference

All prompts & walkthrough files saved in `/mnt/user-data/outputs/`:
- `00_URUTAN_PENGERJAAN.md` — execution order explanation
- `PROMPT_A_BOOKING_ENGINE_FOUNDATION.md` — done ✅
- `PROMPT_B_DYNAMIC_FEATURE_FLAGS_SUPERADMIN.md` — ready to execute
- `PROMPT_C_AUTOMATED_WA_NOTIFICATIONS.md` — ready to execute
- `PROMPT_D_PWA_PUSH_NOTIFICATIONS.md` — ready to execute
- `PROMPT_E_LANDING_PRICING_CARDS.md` — ready to execute
- `implementation_planA` — Antigravity's initial plan
- `walkthroughA1` — Antigravity's final execution result

---

## Rules for Agent (Gemini 3.1 Pro / Antigravity)

When continuing on Claude Desktop, agent should:

1. **Read prompt file first** — full prompt (A/B/C/D/E) before asking questions
2. **Verify structure with actual codebase** — don't assume, grep/check real files
3. **Decision-critical: ask, don't guess** — if instruction conflicts with reality, ask for clarification
4. **Transactional mindset** — minimize data inconsistency risks
5. **Test checklists included** — verify build + manual test before declaring done
6. **Document assumptions** — always explain trade-offs made
7. **Backward compatibility** — existing features stay unbroken unless explicitly asked to change

---

## Communication Style

- **Tone:** Casual Indonesian + English mix (follow existing code tone: "waduh", "yuk", "dong", "nih")
- **No fluff:** Direct, action-oriented
- **Data-driven:** Always explain WHY, not just WHAT
- **User first:** Business logic, not technical gymnastics

---

**Last Updated:** 6 Sep 2026  
**Ready to Continue:** Yes, start with Prompt B ✅

