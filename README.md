# PaDC Website MVP

Next.js/Vercel MVP for the Pennsylvania Driver Cooperative website.

## Stack

- Next.js App Router
- Supabase Postgres for leads and messages
- Vercel hosting
- Server-side API routes for secure form submissions
- Password-protected admin dashboard at `/admin`

## Local Setup

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in:

   ```text
   NEXT_PUBLIC_SUPABASE_URL=
   SUPABASE_SERVICE_ROLE_KEY=
   ADMIN_PASSWORD=
   ADMIN_SESSION_SECRET=
   ```

3. In Supabase SQL editor, run:

   ```text
   supabase/schema.sql
   ```

4. Start the app:

   ```powershell
   npm run dev
   ```

## Deployment

1. Import the repo into Vercel.
2. Set the same environment variables in Vercel project settings.
3. Deploy from the feature branch, test forms/admin, then promote to production.

Legacy static URLs such as `/padc-homepage.html` and `/padc-drivers.html` redirect to the new Next.js routes.
