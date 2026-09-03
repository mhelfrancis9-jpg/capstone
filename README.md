# LnR Cycle Center — Capstone

Next.js 16 (App Router) + TypeScript + Supabase admin system for **LnR
Cycle Center**. The UI follows the Figma *“Admin Page Prototype (Villar,
Regalado, Ropa)”* design (Open Sans, `#F9FAFB` surfaces, `#E5C034` brand
accent).

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — visitors are
redirected to the administrator login at `/admin/login`.

## Configuration

Copy `.env.example` to `.env.local` and fill in your Supabase project
credentials (Project Settings → Data API):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> The app renders (and builds) without these keys for development, but
> signing in and password reset require a configured Supabase project.
> Create an admin user in **Authentication → Users** and confirm their
> email before your first sign-in.

## Admin routes

| Route | Purpose |
| --- | --- |
| `/admin/login` | Administrator sign-in (email + password) |
| `/admin/reset-password` | Set a new password via the emailed reset link |
| `/admin` | Minimal dashboard placeholder (session protected) |

Auth flow details:

- Auth is implemented with `@supabase/ssr`:
  - `lib/supabase/config.ts` — reads the env keys once.
  - `lib/supabase/server.ts` — server client + memoized `getUser()`.
  - `lib/supabase/proxy.ts` — cookie refresh/guard helper.
  - `proxy.ts` — Next.js 16 proxy (formerly *middleware*) that guards
    `/admin/*` and redirects signed-in users away from the login page.
- Sign-in runs in a **Server Action** (`app/admin/login/actions.ts`) so
  the session cookie is written server-side.
- “Forgot password?” uses `resetPasswordForEmail` and points the emailed
  link at `/admin/reset-password`, which exchanges the recovery code for a
  session and calls `updateUser({ password })`.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (flat config, next/core-web-vitals) |

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase SSR guide](https://supabase.com/docs/guides/auth/server-side)
- [Proxy (Next 16, formerly middleware)](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
