# Alumni Gallery

A digital yearbook for alumni discovery, batch pages, approved memories, and school-led moderation. The local demo uses fictional people and stories. Stock portraits are illustrative and do not depict the named alumni.

## What is here

- **Brand:** an original open-yearbook logo, small-screen icon, and app manifest in `public/`.
- **Public:** home, searchable alumni directory (grid/list, year, program, sort, pagination), alumni profiles, yearbooks, memories, and keepsake gallery.
- **Alumni:** registration with private school evidence, sign-in, profile and portrait submission, audience choice, memory drafts, writing and photo uploads, edits and withdrawal, reactions, comments, and reports.
- **Moderators:** verification queue visibility, profile, photo, memory, and comment review; change requests; reports; featured public memories; statistics and audit history.
- **School administrators:** alumni identity approval, all moderation functions, plus batch and program management.
- **Review status:** Draft, Pending Review, Published, Rejected (shown as “Changes requested”), and Archived. Public APIs only return published content allowed by its owner.

## Figma reference

The Figma Make connector returned a source manifest naming `Layout`, `AlumniProfileView`, `YearbookView`, `MemoriesView`, and `HonorsView`. Its actual source resources and screenshot could not be opened in this session, and the public page reader could not access the Make URL. The application follows the recognizable gallery/profile/yearbook/memories page structure, but the visual design is an original interpretation of the brief. No exact wireframe colors, spacing, assets, or flows are claimed.

## Architecture

- React, TypeScript, Vite, Bootstrap 5, and a custom CSS design system.
- Hono TypeScript API shared by the Node local demo server and the Cloudflare Worker. The demo runs with a separate in-memory store; production uses PostgreSQL through Hyperdrive.
- Production photos use private Cloudflare R2 objects. Metadata and moderation state are in PostgreSQL. The Worker serves approved, audience-appropriate images through an authenticated route and uses `Cache-Control: private, no-store`.
- The committed `wrangler.jsonc` deploys the clearly labeled fictional demo without external bindings. Copy `wrangler.production.example.jsonc` to a private production config and replace its resource values before deploying real alumni data.
- Passwords use salted PBKDF2-SHA256. Sessions are random 256-bit tokens stored as hashes in PostgreSQL, with HttpOnly, Secure (production), SameSite=Strict cookies. Mutating browser requests are checked against `APP_ORIGIN`.
- Inputs are validated with Zod. Core role and ownership checks run on the API. Migrations create normalized users, sessions, programs, batches, profiles, verification requests, memories, photos, reactions, comments, reports, moderation decisions, and audit events with indexes.
- The frontend is an SPA served as Cloudflare Worker static assets. `/api/*` executes the Worker first, and direct page URLs fall back to the app shell.

## Local demo

Requirements: Node.js 20.19+ (24 tested) and npm. PostgreSQL, R2, Cloudflare credentials, and email are **not** needed for this demo.

```powershell
cd "C:\Personal Project\Alumni's Gallery"
npm install
npm run dev
```

Open `http://127.0.0.1:5173`. Vite proxies `/api` to the Hono demo server on `127.0.0.1:8788`. Demo data resets when the API process restarts.

| Role | Email | Password |
| --- | --- | --- |
| Alumnus | `maya-chen@example.test` | `AlumniDemo2026!` |
| Moderator | `mod@example.test` | `ModeratorDemo2026!` |
| Administrator | `admin@example.test` | `AdminDemo2026!` |

You can also register a new fictional alumnus and complete the review journey. Register with a listed batch and program, provide sample school evidence, upload a portrait, then submit a profile and memory. The school administrator must approve verification first; a moderator can then approve uploaded photos and the profile or memory. A rejection note appears in the owner's account. Never use real personal records in the demo.

```powershell
npm run typecheck
npm test
npm run build
npm run test:browser  # keep npm run dev running in another terminal
```

The browser check uses the installed Chrome executable at `C:\Program Files\Google\Chrome\Application\chrome.exe`. Change that path in `scripts/browser-check.mjs` if Chrome is elsewhere.

## Production setup

1. **PostgreSQL:** Create an empty database named `alumni_gallery` with a dedicated application user. Give the app user access to the created tables. Set `DATABASE_URL` in your shell or a local, uncommitted environment file, then run `npm run db:migrate`. The migration is `migrations/001_initial.sql`. The demo seed is never applied to production.
2. **First administrator:** Set `ADMIN_EMAIL` and a long random `ADMIN_PASSWORD` along with `DATABASE_URL`, then run `npm run db:create-admin`. Remove the password from your shell history and environment afterward. Sign in and create your school's programs and batches before alumni registration.
3. **Hyperdrive:** Create a Cloudflare Hyperdrive configuration against the PostgreSQL connection string. Copy `wrangler.production.example.jsonc` to a private file such as `wrangler.production.jsonc`, replace `REPLACE_WITH_REAL_HYPERDRIVE_UUID` with the real UUID, then deploy with `npx wrangler deploy --config wrangler.production.jsonc`. The Worker uses its `HYPERDRIVE.connectionString`. For `wrangler dev` against a local database, set `CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE` to a local PostgreSQL URL.
4. **R2:** Create a private bucket named `alumni-gallery-photos`, or change `bucket_name` in the private production config. The Worker needs its `PHOTOS` binding. Uploaded objects use generated keys under the user's ID and are never exposed through a public bucket URL.
5. **Origin and school identity:** Set `APP_ORIGIN` in the private production config to the exact HTTPS origin that serves the Worker. Replace the generic Alumni Gallery name, monogram, content, colors, and sample imagery with approved school material before a real school launch.
6. **Email and account recovery:** Email delivery is not connected in this build. The API has an optional email callback but the Worker does not configure a provider. Choose and approve a transactional email provider, sender domain, recipients, and message payloads before connecting it. Add email ownership verification, password reset, and Cloudflare rate limits before inviting real alumni. The in-app review queue and status messages work without email.
7. **Deploy:** Run `npm run build`, then `npx wrangler deploy` to publish the fictional demo. For the production database-backed app, run `npx wrangler deploy --config wrangler.production.jsonc` after authenticating Wrangler and setting real binding values. The `deploy` npm script builds and publishes the demo configuration.

Cloudflare's [Hyperdrive PostgreSQL guide](https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/), [R2 Worker binding guide](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/), and [Worker static assets guide](https://developers.cloudflare.com/workers/static-assets/) describe resource creation and routing.

## Production verification

After deployment:

1. Open `/`, `/alumni`, `/years/<year>`, and a profile URL directly, then refresh each.
2. Request `/api/health` and `/api/bootstrap`; confirm the API reports production mode and batches/programs from PostgreSQL.
3. Register a test account, sign in, upload a JPG/PNG/WebP under 5 MB, and confirm it is inaccessible to visitors while pending.
4. Approve verification, photo, and content using a moderator account. Confirm public and verified-only visibility from separate sessions.
5. Confirm a visitor receives 403 on admin routes and 404 for hidden/private profile and image URLs. Test edit, archive, reaction, comment review, report resolution, and the audit log.
6. Verify R2 contains generated object keys and PostgreSQL contains photo metadata, moderation decisions, and audit events.

## Known production gaps

Email delivery, email ownership verification, password reset, and provider-side anti-abuse limits still need configuration and verification. No production database, R2 bucket, Hyperdrive ID, Cloudflare account/domain, or verified school branding was available in the workspace, so live deployment and PostgreSQL/R2 integration tests were not run.
