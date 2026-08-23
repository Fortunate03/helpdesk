# ICT Help Desk

A support portal where people report ICT problems, follow them through to resolution, and where
staff work the queue. Built with Next.js, Drizzle and PostgreSQL.

## Requirements

- Node.js 20.9 or newer (developed on 24.19)
- Docker, for the local PostgreSQL container

## Getting started

```bash
cp .env.example .env          # then set BETTER_AUTH_SECRET (see below)
npm install
docker compose up -d          # PostgreSQL 17 on :5432
npm run db:migrate            # create the schema
npm run db:seed               # create the three demo accounts
npm run dev                   # http://localhost:3000
```

Generate a secret for `.env` with:

```bash
openssl rand -base64 32
```

### Demo accounts

The seed creates these three accounts and no requests, so the system starts empty.

| Role | Email | Password |
| --- | --- | --- |
| Administrator | `admin@helpdesk.co.za` | `admin` |
| Technician | `technician@helpdesk.co.za` | `user` |
| User | `user@helpdesk.co.za` | `user` |

These short passwords exist only in the seed script, which uses its own Better Auth instance with
a lowered minimum. Registration through the site still requires at least 8 characters — signing in
does not check length, which is why the demo accounts work. Change
`minPasswordLength` in `src/db/seed.ts` if you would rather the demo data used strong passwords too.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm run db:generate` | Generate a migration from schema changes |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:seed` | Wipe all requests and accounts, then recreate the demo accounts |
| `npm run db:studio` | Drizzle Studio, a browser GUI for the database |

## How it is put together

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, tokens defined in `src/app/globals.css` |
| Database | PostgreSQL 17 via Drizzle ORM |
| Auth | Better Auth with the admin plugin for roles |
| Validation | Zod, shared between the form and the server action |

```
src/
  actions/      server actions — tickets and user management
  app/          routes
  components/   ui/ primitives · layout/ chrome · tickets/ · admin/ · auth/
  db/           schema, client, migrations entry point, seed
  lib/          auth, permissions, session helpers, validation, constants
drizzle/        generated SQL migrations
```

### Roles

- **User** — submits requests and tracks their own.
- **Technician** — works requests assigned to them, can leave internal notes.
- **Administrator** — sees everything, assigns technicians, manages accounts.

Anyone can register, and always arrives as a User. Technician and administrator accounts are
created by an administrator at `/admin/users`. Better Auth marks the role column as
non-input, so a role cannot be set through the public sign-up endpoint either.

### A few decisions worth knowing

**Reference numbers are random, not sequential.** Twelve characters from a Crockford Base32
alphabet (no I, L, O or U), generated in `src/lib/reference.ts`. A counter would let anyone read
one reference and walk through every other request on the public tracker. 32^12 is about
1.2 x 10^18, and the unique index plus a retry in `submitTicket` covers a collision.

Lookups normalise what people type, so case, spaces, dashes and the usual O/0 and I/1 mix-ups
still resolve to the right request.

**Middleware is not the authorisation boundary.** `middleware.ts` only checks that a session
cookie exists, to redirect signed-out visitors cheaply. Every protected page and every server
action independently re-checks the real session and role through `requireUser` / `requireRole`
in `src/lib/session.ts`.

**Password reset works without an email provider.** `sendResetPassword` in `src/lib/auth.ts`
writes the reset link to the server log, and in development the link is also shown on the
Forgot Password page so a reset can be demonstrated without terminal access.

That on-screen link is gated by `SHOW_RESET_LINK` in `src/lib/reset-links.ts`: on automatically
when `NODE_ENV` is not `production`, and in production only if `DEMO_SHOW_RESET_LINK=true` is set
explicitly. Leave it unset on anything real — showing the link to whoever types an email address
means anyone can reset any account, including an administrator's.

For actual email, swap the body of `sendResetPassword` for a transactional send. Neon hosts the
database and does not send email; free options include Resend (3,000/month) and Brevo. Nothing
else in the reset flow changes.

**Guests can submit.** A request without an account has a null `user_id` and is reachable only
through `/track`, which exposes status, category and dates — never the description or the
requester's details.

## Changing the branding

Name, contact details and operating hours live in `src/lib/constants.ts`. Editing them there
updates the header, footer, Contact page and Submit sidebar together.

## Deploying

Local and production both run PostgreSQL, so no schema changes are needed.

1. Create a database (for example a free Neon project).
2. Run migrations against the **direct** connection string:
   `DATABASE_URL="<direct-url>" npx tsx src/db/migrate.ts`, then seed the accounts the same way.
3. Import the repository into Vercel and set the variables below.

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | the **pooled** connection string (the host containing `-pooler`) |
| `BETTER_AUTH_SECRET` | a fresh `openssl rand -base64 32`, not the local one |
| `BETTER_AUTH_URL` | the deployed origin, e.g. `https://your-app.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | the same deployed origin |

Neon gives two hosts and they are not interchangeable. Migrations need the direct host; the
running app needs the pooled one, because serverless instances would otherwise exhaust the
connection limit. `src/db/index.ts` detects `-pooler` in the URL and turns off prepared
statements, which PgBouncer's transaction mode cannot support.

`BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` must be the real deployed origin, otherwise session
cookies and reset links point at localhost. Leave `DEMO_SHOW_RESET_LINK` unset.
