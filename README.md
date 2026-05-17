# Koviloor Hub

A single launcher for all my deployed apps — grouped by institution, with search and last-opened tracking.

## Apps included

**Karaikudi Annalakshmi**
- KAL Payroll
- Kitchen Maintenance
- Waste Audit
- KAL Monitor

**Koviloor Madalayam**
- Property Management
- Koviloor Kitchen
- Guru Pooja
- NWT Scholarship
- Nagarathar Jobs

**Kasi / Varanasi**
- Kasi Payroll
- Annakshetra Bills

**Coming Soon**
- KACPE Payroll

## Stack
React + Vite, no backend, no auth. Last-opened timestamps stored in `localStorage` (per-browser).

## Local dev
```bash
npm install
npm run dev
```

## Deploy
1. Create GitHub repo `karaikudiannalakshmi/koviloor-hub`
2. Push this folder
3. Import to Vercel — no env vars needed
4. Vercel will auto-detect Vite

## Adding/editing apps
Edit `src/apps.js` only. Each entry needs:
- `id` (unique string)
- `name` (display name)
- `description` (one short line)
- `url` (production URL, or `null` for coming-soon)
- `icon` (Tabler icon name, e.g. `ti-cash`)
- `group` (must match one entry in `GROUP_ORDER`)
- `comingSoon: true` (optional, for grayed-out tiles)

Browse icons at https://tabler.io/icons

## Notes
- Hub is public (no login)
- Dark mode follows system preference automatically
- No analytics, no tracking — last-opened stays in your browser only
