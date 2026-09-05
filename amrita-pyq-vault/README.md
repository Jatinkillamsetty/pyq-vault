# Amrita PYQ Vault

## What's new

- **Login & signup** (`/login`, `/signup`) — email + password, gated to
  `@amrita.edu` / `@cb.amrita.edu` addresses only (edit `ALLOWED_EMAIL_DOMAINS`
  in `.env` to add campus subdomains like `@blr.amrita.edu`).
- **Route protection** — `middleware.ts` redirects any signed-out visitor to
  `/login` for every page except `/login`, `/signup`, and the NextAuth API.
- **Browse by Branch** (`/browse`) — was 404, now a working page.
- **AI Exam Cheatsheets** (`/cheatsheets`) — was 404, now a working page.
- Sidebar shows the real logged-in user and has a working **Sign out** button.

## First-time setup

```bash
npm install
cp .env.example .env
# generate a real secret and paste it into NEXTAUTH_SECRET:
openssl rand -base64 32

npx prisma migrate dev --name init   # creates prisma/dev.db (SQLite, zero setup)
npm run dev
```

Then open http://localhost:3000 — you'll be redirected to `/signup`. Create an
account with any `@amrita.edu` / `@cb.amrita.edu` email; anything else is
rejected both in the UI and on the server.

## Notes

- Auth uses **NextAuth Credentials provider** with bcrypt-hashed passwords
  stored via Prisma (`User.password`). No Google OAuth needed for this to
  work, though the `.env.example` still has slots for it if you want to add
  Google Sign-In restricted to Amrita accounts later.
- The DB defaults to **SQLite** (`prisma/dev.db`) so login/signup work
  immediately without installing Postgres. For production, change
  `provider = "sqlite"` back to `"postgresql"` in `prisma/schema.prisma` and
  point `DATABASE_URL` at a real Postgres instance — the schema itself is
  compatible with both.
- `/browse` and `/cheatsheets` currently render from the same mock dataset
  (`lib/demoData.ts`) that `/` uses. Swap in a Prisma query
  (`prisma.paper.findMany(...)`) once real papers are being uploaded.
