# Reelyou beta backend deployment

## Step 1 — Local server secrets (required before device testing)

1. Open `Reelyou/server`.
2. Copy `server/.env.example` → `server/.env` (never commit).
3. Set **`AUTH_JWT_SECRET`** and **`FRIEND_MATCH_PEPPER`** (each at least 32 characters; use two different values).
4. From `Reelyou/`, run `npm run server:start` (or `npm run start --prefix server`).
5. In the app, copy `.env.example` → `.env` and set **`EXPO_PUBLIC_REELYOU_API_URL=http://localhost:8787`** (use your LAN IP instead of `localhost` on a physical device).

**Completion check:** `server/.env` exists locally and `GET http://localhost:8787/health` returns `{ "ok": true }`.

---

## What the server needs at runtime

| Concern | Requirement |
|--------|-------------|
| **Auth** | `AUTH_JWT_SECRET` (≥32 chars). JWT on `Authorization: Bearer`. |
| **Friend discovery** | `FRIEND_MATCH_PEPPER` (≥32 chars). Contact matching is server-side only. |
| **Accounts, follows, blocks, text skywrites** | **`DATABASE_URL`** (PostgreSQL) for beta deploys. Without it, data lives in `REELYOU_DB_PATH` JSON (fine for local dev only). |
| **Skywrite photos/videos** | Still stored on-device in compose today; **no upload API** in this repo yet. Beta “shared posts” for rich media need object storage (e.g. Cloudflare R2) in a follow-up. |
| **OpenAI (Starpath)** | Optional `OPENAI_API_KEY`. |
| **CORS** | `CORS_ORIGIN` comma list including your Expo web dev URL and production web origin. |

---

## Existing hosting in this repo

- **EAS** (`eas.json`) — mobile builds only; not the API.
- **No** checked-in production API URL, Render/Fly service, or domain.

---

## Recommended beta host: Render + PostgreSQL

**Why:** Matches the Node HTTP server, Docker deploy, managed Postgres, and `render.yaml` in this repo.

**Cost:** About **$14/month** (PostgreSQL Basic ~$7 + Web Starter ~$7). Confirm current pricing in the dashboard before creating paid resources.

### First setup action (you run this; deployment is not done until the service is green)

1. Open **[Render Dashboard](https://dashboard.render.com/)** and sign in.
2. **New → PostgreSQL** → name `reellyou-db`, plan **Basic 256MB** → Create (note monthly cost).
3. **New → Web Service** → connect GitHub repo `MichaelAlli/Reelyou`, branch `feature/post-welcome-theme-system`, root directory **`Reelyou`**, runtime **Docker**, Dockerfile path **`server/Dockerfile`**, Docker context **`server`**.
4. Environment variables on the web service:
   - `NODE_ENV=production`
   - `DATABASE_URL` = internal connection string from `reellyou-db`
   - `AUTH_JWT_SECRET` = (generate ≥32 chars)
   - `FRIEND_MATCH_PEPPER` = (different ≥32 chars)
   - `CORS_ORIGIN` = your Expo web URL(s) and future HTTPS app origin
5. Deploy. When healthy, copy the **`https://….onrender.com`** URL (Render assigns this; do not guess).

**App env after deploy:**

- `EXPO_PUBLIC_REELYOU_API_URL=https://YOUR-SERVICE.onrender.com`
- `EXPO_PUBLIC_APP_ORIGIN=https://YOUR-WEB-APP-ORIGIN` (for invite links)

Alternatively: **New → Blueprint** and point at `render.yaml` in the `Reelyou` folder after secrets are set in the dashboard.

---

## Two-account test checklist (after API URL is live)

1. **Account A** — Sign up on Day sign-up screen; confirm session in app.
2. **Account B** — Second email/password; login.
3. **Follow** — A follows B; both see updated follow counts via social sync.
4. **Discovery** — Patch discovery settings; re-fetch; optional contact match if phones are set on accounts.
5. **Post sharing** — Text skywrites via API sync when auth is on; rich Skywrite media remains local until upload work lands.
6. **Invites** — With `EXPO_PUBLIC_APP_ORIGIN` set to HTTPS, invite share should copy/open a real link (not blocked).

---

## GitHub

Push deployment commits to `feature/post-welcome-theme-system` and verify:

```bash
git rev-parse HEAD
git rev-parse origin/feature/post-welcome-theme-system
```

Both SHAs must match after `git push`.
