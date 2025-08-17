1) The first symptom: P1001: Can't reach database server
What it seems to mean: “The host is down.”
What it actually means: Prisma couldn’t establish a TCP connection to the host/port in your DATABASE_URL.

You tried ping and it timed out. That’s normal—cloud load balancers (AWS ELB) usually drop ICMP. Ping is irrelevant for databases.

We tested the right thing: TCP on port 5432.

Windows

powershell
Copy
Edit
Test-NetConnection aws-0-ap-south-1.pooler.supabase.com -Port 5432
You got TcpTestSucceeded : True → The host and port are reachable from your machine.

Conclusion: Not a raw network block. The issue was likely how Prisma read your env vars (or the exact connection string), not the internet.

2) The real root cause #1: Env loading mismatch (Next.js vs Prisma)
Next.js loads .env.local (server-side) for next dev/start, but Prisma CLI does not read .env.local by default.

Prisma looks for a .env file next to schema.prisma (or in the CWD when you don’t pass --schema), not .env.local.

Your npm script:

json
Copy
Edit
"migrate": "prisma generate --schema app/db/schema.prisma && dotenv -e .env.local -- prisma migrate dev --schema app/db/schema.prisma --name init"
dotenv -e .env.local -- only applied to the second command.
prisma generate ran without the env vars → can trigger P1001 or other oddities.

Fix patterns that always work:

Prisma-native way (recommended): put an .env in the same folder as your schema:

arduino
Copy
Edit
app/
  db/
    schema.prisma
    .env        # Prisma auto-loads this
Or wrap each Prisma command with dotenv-cli:

json
Copy
Edit
"migrate": "dotenv -e .env.local -- prisma generate --schema app/db/schema.prisma && dotenv -e .env.local -- prisma migrate dev --schema app/db/schema.prisma --name init"
Or set envs inline for the shell session (PowerShell):

powershell
Copy
Edit
$env:DATABASE_URL="..."; $env:DIRECT_URL="..."; npx prisma migrate dev --schema app/db/schema.prisma
Minute checks

Restart your dev server after editing envs (they’re read once at process start).

Ensure schema.prisma matches var names:

prisma
Copy
Edit
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
Quick sanity print:

powershell
Copy
Edit
node -e "require('dotenv').config(); console.log('Has DATABASE_URL?', !!process.env.DATABASE_URL)"
3) Supabase specifics: pooled vs direct connections
Supabase gives you two kinds of hosts:

Pooler (PgBouncer) → good for app runtime; keep connections low.

Use this for DATABASE_URL.

Typical params: ?sslmode=require&pgbouncer=true&connection_limit=1

Direct (non-pooler) Postgres → needed for migrations/DDL.

Use this for DIRECT_URL so Prisma runs migrations outside PgBouncer.

Why? PgBouncer is great for transactions but can block/alter DDL and session features Prisma needs for schema changes.

4) Second symptom: P3006 with ERROR: type "citext" does not exist
What happened: your schema uses @db.Citext (Prisma’s mapping to Postgres citext), but citext is an extension that must be created per database.

Prisma uses a shadow database to compute schema drift. The shadow DB didn’t have citext.

Result: replaying your migration into the shadow DB failed on the first citext column.

Fix: enable the extension in SQL before any tables use it.

Add to the very top of your migration:

sql
Copy
Edit
CREATE EXTENSION IF NOT EXISTS "citext";
If no migration file existed yet (because creation failed early), generate one without applying:

powershell
Copy
Edit
npx prisma migrate dev --create-only --schema app/db/schema.prisma --name init
then edit app/db/migrations/<timestamp>_init/migration.sql and insert the CREATE EXTENSION ... line.

Shadow DB plumbing (so it always works):

prisma
Copy
Edit
datasource db {
  provider          = "postgresql"
  url               = env("DATABASE_URL")         // pooler
  directUrl         = env("DIRECT_URL")           // non-pooler
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")  // non-pooler, e.g. .../postgres_shadow
}
Point SHADOW_DATABASE_URL at a non-pooled DB (often a throwaway DB in the same instance).

That DB also needs the extension (your migration will create it).

Temporary dev-only bypass:

powershell
Copy
Edit
$env:PRISMA_MIGRATE_SKIP_SHADOW_DATABASE="1"
npx prisma migrate dev --schema app/db/schema.prisma
(Useful to unblock, but configure a proper shadow DB later.)

5) Third symptom: “Migration was modified after it was applied”
You edited an already-applied migration file to add CREATE EXTENSION. Prisma stores a checksum; when the file changes, it refuses to continue.

Two clean routes:

Option A — Drop and restart (dev DB)

powershell
Copy
Edit
npx prisma migrate reset --schema app/db/schema.prisma
# then
npx prisma migrate dev --create-only --schema app/db/schema.prisma --name init
# edit migration.sql: add the extension at top
npx prisma migrate dev --schema app/db/schema.prisma
Fast, but drops data.

Option B — Preserve data

Revert your edits so the original migration file matches its checksum.

Confirm it’s marked applied (or resolve explicitly):

powershell
Copy
Edit
npx prisma migrate resolve --applied 20250813091527_init --schema app/db/schema.prisma
Create a new migration only for the extension:

powershell
Copy
Edit
npx prisma migrate dev --create-only --schema app/db/schema.prisma --name enable_citext
Edit it to contain just:

sql
Copy
Edit
CREATE EXTENSION IF NOT EXISTS "citext";
Apply:

powershell
Copy
Edit
npx prisma migrate dev --schema app/db/schema.prisma
If the shadow still balks (because replaying older migrations hits citext columns), ensure shadowDatabaseUrl is set to a direct DB and/or use the temporary skip env var once to get past it.

6) The final, working state (what you ended up with)
Connectivity verified via TCP test (Test-NetConnection).

Prisma envs loaded reliably (either .env next to the schema or dotenv-cli on every command).

DATABASE_URL → pooler with sslmode=require&pgbouncer=true&connection_limit=1.

DIRECT_URL → non-pooler with sslmode=require.

(Optional, recommended) SHADOW_DATABASE_URL → non-pooler DB (e.g., postgres_shadow).

First migration (or an early one) starts with:

sql
Copy
Edit
CREATE EXTENSION IF NOT EXISTS "citext";
Migration history is clean (no edited-applied files), so prisma migrate dev succeeds.

7) Tiny but important gotchas we avoided (or fixed)
dotenv-cli vs dotenv: dotenv -e requires dotenv-cli installed; otherwise it does nothing.

Command scoping: dotenv -e .env.local -- applies only to the next command. Chain it for each command.

File placement: .env.local is fine for Next.js runtime; Prisma wants .env next to schema.prisma (or explicit loading).

Var name mismatch: env("DATABASE_URL") in schema.prisma must match your actual env key.

Quotes/whitespace: watch out for trailing spaces or smart quotes in URLs.

Restart required: after changing env files, restart dev server.

Single PrismaClient in Next.js dev to avoid exhausting pooled connections:

ts
Copy
Edit
import { PrismaClient } from '@prisma/client';
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
8) A compact checklist for next time
TCP reachability: Test-NetConnection host -Port 5432 (or nc -vz on mac/Linux).

Prisma envs:

Put .env beside schema.prisma, or

Use dotenv -e .env.local -- for every Prisma command, or

Inline $env:... before the command.

Supabase URLs:

DATABASE_URL → pooler + sslmode=require&pgbouncer=true&connection_limit=1

DIRECT_URL → non-pooler + sslmode=require

(optional) SHADOW_DATABASE_URL → non-pooler DB for shadow

Extensions first: add CREATE EXTENSION IF NOT EXISTS "citext"; before any @db.Citext columns.

Don’t edit applied migrations. If you must: either reset (dev) or add a new migration and/or migrate resolve.

If shadow blocks you: set shadowDatabaseUrl or temporarily PRISMA_MIGRATE_SKIP_SHADOW_DATABASE=1 (dev only).