# Reelyou beta backend deployment

## Build and start (this repository)

| Context | Command |
|--------|---------|
| Install server deps | `npm ci --prefix server` (from `Reelyou/`) |
| Run API locally | `npm run server:start` or `npm run start --prefix server` |
| Server tests (incl. media) | `npm run server:test` or `npm test --prefix server` |
| App (Expo) | `npm install` then `npx expo start` from `Reelyou/` |
| Production API image | `docker build -f server/Dockerfile server` |
| Render deploy | Connect repo, root `Reelyou`, Docker context `server`, see `render.yaml` |

## Database migration

There is **no separate SQL migration tool**. On first boot with **`DATABASE_URL`** set, the server creates Postgres table `reellyou_app_state` and stores the full app document (users, follows, skywrites, **media asset metadata**). Existing JSON file data is **not** auto-imported — copy accounts manually only if you need a one-off migration.

Local dev without Postgres uses **`REELYOU_DB_PATH`** (JSON file).

---

## Step 1 — Local server secrets

1. Copy `server/.env.example` → `server/.env` (never commit).
2. Set **`AUTH_JWT_SECRET`** and **`FRIEND_MATCH_PEPPER`** (each ≥32 chars, different values).
3. For local media tests: `MEDIA_STORAGE=local`, `MEDIA_LOCAL_ROOT=./data/media`.
4. Run `npm run server:start` from `Reelyou/`.
5. App: copy `.env.example` → `.env`, set **`EXPO_PUBLIC_REELYOU_API_URL=http://localhost:8787`**.

---

## Required environment variable names

### Server (`server/.env` or host dashboard)

| Variable | Purpose |
|----------|---------|
| `NODE_ENV` | `production` on hosted API |
| `PORT` | HTTP port (default `8787`) |
| `AUTH_JWT_SECRET` | JWT signing (≥32 chars) |
| `FRIEND_MATCH_PEPPER` | Contact blind index (≥32 chars) |
| `DATABASE_URL` | **Required in production** — Postgres |
| `REELYOU_DB_PATH` | Local JSON DB when `DATABASE_URL` empty |
| `CORS_ORIGIN` | Comma-separated allowed web origins |
| `MEDIA_STORAGE` | `s3` in production; `local` for dev/tests only |
| `MEDIA_S3_ENDPOINT` | R2/S3 endpoint URL |
| `MEDIA_S3_REGION` | e.g. `auto` for R2 |
| `MEDIA_S3_BUCKET` | Bucket name |
| `MEDIA_S3_ACCESS_KEY_ID` | Object storage key (server only) |
| `MEDIA_S3_SECRET_ACCESS_KEY` | Object storage secret (server only) |
| `MEDIA_SIGNED_URL_TTL_SEC` | Signed read URL lifetime (default `900`) |
| `MEDIA_LOCAL_ROOT` | Dev/test filesystem root when `MEDIA_STORAGE=local` |
| `OPENAI_API_KEY` | Optional Starpath |

### App (`.env` / EAS env — no secrets)

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_REELYOU_API_URL` | HTTPS API base |
| `EXPO_PUBLIC_REELYOU_AUTH_ENABLED` | `true` when using server auth |
| `EXPO_PUBLIC_APP_ORIGIN` | HTTPS web origin for invite links |

---

## Shared media architecture

1. Client creates upload session → `POST /v1/media/upload-sessions` (Bearer).
2. Client **PUT**s bytes to presigned URL (S3/R2) or `PUT /v1/media/upload/...` (local dev).
3. Client completes → `POST /v1/media/upload-sessions/{assetId}/complete`.
4. Publish skywrite with asset ids + framing/audio metadata → `POST /v1/content/skywrites`.
5. Playback resolves signed URLs → `GET /v1/media/assets/{assetId}/access`.
6. Visibility enforced server-side (`private`, `orbit`, `sky_friends`, `public`).

---

## External setup checklist (after code is on GitHub)

1. **Postgres** — Render **New → PostgreSQL** (~$7/mo) or equivalent; copy **`DATABASE_URL`** to the web service.
2. **Object storage** — [Cloudflare R2](https://dash.cloudflare.com/) (recommended, S3-compatible): create bucket, API token with Object Read & Write, set **`MEDIA_S3_*`** on the API service. R2 storage pricing is usage-based (often low for beta; confirm in dashboard).
3. **Render Web Service** — Docker from `server/Dockerfile`, env vars above, **`MEDIA_STORAGE=s3`**, **`NODE_ENV=production`**.
4. **App** — Set **`EXPO_PUBLIC_REELYOU_API_URL`** to the live `https://….onrender.com` URL Render shows when deploy succeeds.

---

## Tests

| Type | What runs |
|------|-----------|
| **Implementation (local, no cloud)** | `npm test --prefix server` — auth, social, **media upload + visibility** with `MEDIA_STORAGE=local` |
| **Client unit** | `npx tsx src/social/sharedMediaConstants.test.ts` |
| **Live upload E2E** | **Blocked** until R2/S3 + deployed API + two real accounts are configured |

---

## Two-account checklist (live, after deploy)

1. A publishes photo/video Skywrite (public) — confirm publish succeeds (upload + API).
2. B follows A (if needed for visibility tier), opens Play Sky / library — media plays via signed URL.
3. Restart API container — posts and media still available.
4. A deletes post — B loses access (403 on media access).

---

## GitHub

```bash
git rev-parse HEAD
git rev-parse origin/feature/post-welcome-theme-system
```

SHAs must match after push.
