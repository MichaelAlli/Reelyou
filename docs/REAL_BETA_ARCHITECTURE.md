# Reelyou Beta — actual connected architecture

This document describes what the **Reelyou repo implements today**, not a future plan. Verify live values in Render dashboard and `/health` on your deployed API.

## Auth

| Item | Actual implementation |
|------|------------------------|
| Provider | **Custom Reelyou API** (not Supabase/Firebase/Clerk) |
| Passwords | bcrypt hashes in account store |
| Sessions | JWT access tokens (`Authorization: Bearer`) + refresh tokens |
| Client | `ReelyouAuthProvider`, `reellyouAuthApi.ts`, `EXPO_PUBLIC_REELYOU_AUTH_ENABLED=true` |
| Endpoints | `/v1/auth/register`, `/login`, `/refresh`, `/session`, password forgot/reset, account deletion |

## API

| Item | Actual implementation |
|------|------------------------|
| Host | **Render Web Service** (`render.yaml` → Docker `server/Dockerfile`) |
| Runtime | Node.js, `node --import tsx src/index.ts` in container |
| Public URL | Set in app as `EXPO_PUBLIC_REELYOU_API_URL` (e.g. `https://reellyou-api.onrender.com`) |
| Health | `GET /health` — auth, media, database ping, `emailConfigured`, optional `deploymentRevision` |

## Database

| Item | Actual implementation |
|------|------------------------|
| Production | **Render PostgreSQL** via `DATABASE_URL` (Blueprint `reellyou-db`) |
| Schema | Single table `reellyou_app_state` — one JSONB document (`id=main`) holding users, skywrites, comments, follows, blocks, media asset metadata, recovery tokens, etc. |
| Local dev | JSON file `REELYOU_DB_PATH` when `DATABASE_URL` is empty |
| Persistence | Writes go through `persistAccountDatabase()` → Postgres upsert or file save |

## Object / media storage

| Item | Actual implementation |
|------|------------------------|
| Production | **`MEDIA_STORAGE=s3`** — S3-compatible (Cloudflare R2 recommended) |
| Config | `MEDIA_S3_ENDPOINT`, `MEDIA_S3_BUCKET`, `MEDIA_S3_ACCESS_KEY_ID`, `MEDIA_S3_SECRET_ACCESS_KEY` |
| Upload flow | `POST /v1/media/upload-sessions` → client PUT bytes → `POST .../complete` |
| References | Asset IDs stored on skywrites / profile `avatarMediaKey` |
| Playback | `GET /v1/media/assets/{assetId}/access` (signed URL, visibility enforced) |

## Email

| Item | Actual implementation |
|------|------------------------|
| Provider | **Resend** (`RESEND_API_KEY`) or **SMTP** (`SMTP_*`) in `server/src/email/transactionalEmail.ts` |
| From | `EMAIL_FROM` (must be verified with provider) |
| Reset links | `APP_ORIGIN` + `/reset-password?token=...` |
| Behavior | If provider not configured, forgot-password returns **503** / `email_delivery_failed` (no fake success) |

## Client

| Item | Actual implementation |
|------|------------------------|
| App | **Expo** (React Native + web) |
| API base | `EXPO_PUBLIC_REELYOU_API_URL` |
| Scoped local cache | Per-user AsyncStorage keys via `setActiveStorageUserId` — server is source of truth when auth + shared social enabled |

## StarPath

| Item | Actual implementation |
|------|------------------------|
| Resources | `POST /v1/starpath/resources/discover` — live RSS/grants/arxiv + optional OpenAI explain |
| Personalization | Client-side StarPath state scoped by user; signals from real skywrites/activity when server sync enabled |
| No demo in Beta auth path | Demo seeds gated behind `EXPO_PUBLIC_ENABLE_DEMO_MODE` |

## Beta feature flags (`src/constants/betaFeatures.ts`)

- **Direct messages:** hidden when real auth configured (no server chat yet).
- **Legacy Ripple:** dev demo only.
- **Standalone audio skywrites:** disabled.

## Deploy checklist

See `server/docs/RENDER_BETA_DEPLOY.md` and `docs/BETA_DEPLOYMENT.md`.

Run production smoke: `node scripts/beta-production-e2e.mjs https://your-api.onrender.com`
