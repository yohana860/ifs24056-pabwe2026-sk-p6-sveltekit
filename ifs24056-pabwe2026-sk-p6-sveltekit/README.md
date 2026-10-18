# ifs24056-pabwe2026-sk-p6-sveltekit

Studi Kasus 2 — **Delcom Courses** (SvelteKit 3 + Svelte 5 + TypeScript), Praktikum 6 PABWE 2026.

## Menjalankan
```bash
bun install
bun run dev            # http://localhost:3005
bun run test           # jalankan test (jangan pakai `bun test`)
bun run test:coverage  # wajib 100% (statements, branches, functions, lines)
bun run build && bun start
```

Environment: `.env` (lokal, tidak ikut git) dan `.env.production` (ikut git, dipakai build Vercel):
`VITE_DELCOM_BASEURL=https://open-api.delcom.org/api/v1`, `APP_PORT=3005`.

## Deploy ke Vercel (untuk Delcom Grading)
- Build di Vercel otomatis memakai `@sveltejs/adapter-vercel` (terdeteksi dari env `VERCEL`); lokal tetap `adapter-bun`.
- `vercel.json` menjalankan `npx vite build`. Tidak perlu mengisi env di dashboard karena `.env.production` sudah ada.

## Rute
`/` (daftar kursus), `/courses/[courseId]`, `/courses/[courseId]/contents/[contentId]`, `/auth/login`, `/auth/register`, `/users`, `/profile`. Path lain: halaman 404.
