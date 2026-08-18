# EduStream — Video & Document Sharing Platform

Ek simple video-streaming + document-sharing website, jo college/institute jaisi
chhoti team ke liye bana hai. Next.js (App Router) pe bana hai.

## Features

1. **Super Admin Dashboard** — sab users ko manage karo: block/unblock, role
   change (Student ↔ Super Admin), delete, aur total videos/documents dekho.
2. **Video sharing (YouTube-jaisa)** — koi bhi logged-in user apni videos
   upload kar sakta hai, dusron ki videos dekh sakta hai. Sirf **comments**
   hain, **likes nahi hain** (jaisa aapne bola tha).
3. **Documents (Public/Private)** — students PDF/Word/PPT/images upload kar
   sakte hain. Public documents sabko dikhte hain, Private sirf uploader ko.

## Tech Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS)
- **NextAuth (Auth.js) v5** — credentials-based login (email + password)
- **SQLite + Drizzle ORM** — halka, zero-config database, ek file (`data/app.db`)
- **Cloud file storage** — Cloudinary for videos, documents, and media assets

> Note: Ye setup chhoti/medium team (jaise ek college/institute) ke liye hai.
> Agar future me scale badhana ho, toh niche "Scaling Later" section dekhein.

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Create the database (already done once, but if you reset the schema, run):
npm run db:push

# 3. Seed the Super Admin account
npm run db:seed

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Default Super Admin login

```
Email:    admin@platform.com
Password: Admin@123
```

**Login karne ke baad turant password badalne ka reminder rakhein** — abhi
"change password" feature nahi bana hai (chahen toh bata dein, add kar dunga).

## Environment Variables (`.env.local`)

```
AUTH_SECRET=<already generated for you>
NEXTAUTH_URL=http://localhost:3000
```

Production me deploy karte waqt `NEXTAUTH_URL` ko apni actual domain se badal
dein, aur `AUTH_SECRET` ko naya generate karein:

```bash
openssl rand -base64 32
```

## Project Structure

```
src/
  app/
    page.tsx              → Landing page
    login/, register/     → Auth pages
    videos/                → Video feed + /videos/[id] watch page
    documents/              → Documents feed (public + own private)
    dashboard/              → Student's own videos/documents
    admin/                  → Super Admin dashboard
    upload/video, upload/document → Upload forms
    api/                    → All backend routes (auth, videos, documents, comments, admin)
  db/
    schema.ts               → Database schema (users, videos, comments, documents)
    seed.ts                 → Creates the Super Admin
  components/               → Reusable UI + client components
  middleware.ts             → Route protection (dashboard/admin/upload require login)
```

## Important Behaviors

- Roles: `SUPER_ADMIN` and `STUDENT`.
- `/admin/*` routes only work for `SUPER_ADMIN`.
- `/dashboard/*` and `/upload/*` need any logged-in user.
- Videos: max size 500MB, formats mp4/webm/ogg/mov.
- Documents: max size 25MB, formats pdf/doc/docx/ppt/pptx/txt/png/jpg.
- A blocked user cannot log in (existing sessions still work until they
  expire/sign out — for a hard cutoff, add a session check per request later
  if needed).

## Scaling Later (optional upgrades)

Ye MVP local disk pe files store karta hai — chhoti team ke liye bilkul theek
hai, lekin agar users/videos badh jayein to yeh badlein:

- **Video storage** → move to Bunny.net Stream or Cloudflare Stream for
  adaptive streaming + CDN (cheap and easy for this scale).
- **Document/File storage** → move to Cloudflare R2 or AWS S3.
- **Database** → switch SQLite to PostgreSQL (Supabase/Neon) — the Drizzle
  schema is written generically enough to port with small changes.
- **Deploy** → Vercel (frontend) is a good default; keep the SQLite file on a
  persistent disk if you don't migrate to Postgres (Vercel serverless doesn't
  keep local files across deploys, so for production consider a VPS +
  PM2/Docker, or migrate the DB to Postgres first).

## Scripts

| Command             | What it does                          |
|----------------------|----------------------------------------|
| `npm run dev`         | Start local dev server                |
| `npm run build`       | Production build                      |
| `npm start`           | Run production build                  |
| `npm run db:push`     | Push schema changes to SQLite          |
| `npm run db:seed`     | Create Super Admin account             |
| `npm run db:studio`   | Open Drizzle Studio (visual DB browser)|
