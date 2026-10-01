# Implementation checklist — retention, privacy, legal (internal)

**Updated:** October 1, 2026 — private beta prep

---

## Agreed retention policy vs implementation

| Policy | Implementation status |
|--------|------------------------|
| Saved Skywrites until owner/account delete | **Partial** — local + server; lifecycle varies by sync |
| Play Sky 24h; saved copy remains | **Partial** — `PLAY_SKY_SEQUENCE_WINDOW_MS` in client |
| Deleted posts hidden immediately; 30d recovery | **Partial** — server `deletedAt` + media purge attempt; **30d recovery not built** |
| Account deletion hidden immediately; 30d cancel; 90d purge | **Implemented (beta)** — `server/src/auth/accountDeletion.ts`, API routes, Settings UI |
| Backups/logs retention | **UNVERIFIED** — see provider checklist below |

---

## Account deletion (implemented)

- `POST /v1/auth/account/deletion-request` `{ confirm: true }`
- `POST /v1/auth/account/deletion-cancel` (within 30 days)
- `processScheduledAccountDeletions()` on server boot
- Client: Settings → Delete account

---

## Friend discovery — identifier handling (verified)

| Step | Behavior |
|------|----------|
| Client | Sends **plain** normalized phones/emails in JSON over HTTPS |
| Server | Normalizes; matches **blind HMAC indexes**; does not persist contact arrays in DB |
| **UNVERIFIED** | Render/proxy request logs may capture POST bodies |

---

## Moderation reports (verified)

- Stored **only on device** — `src/moderation/moderationReportService.ts` → AsyncStorage `@reellyou/moderation-reports-v1`
- **No** server upload endpoint

---

## Authentication (verified)

- **Implemented:** email/password register/login/session JWT
- **UI only (no server OAuth):** Google, Apple, Facebook buttons on auth screens without `onPress` wiring to OAuth providers

---

## Legal delivery (beta)

- In-app draft text: `src/constants/legalDocuments.ts` ← sync from `docs/legal/*.md` via `npm run legal:sync`
- Consent version stored locally on signup: `src/auth/legalConsentPersistence.ts`
- **Not** counsel-approved final text — `LEGAL_DOCUMENT_REQUIRES_COUNSEL = true`

---

## Provider retention — MANUAL CHECK REQUIRED

| Provider | What to verify in dashboard |
|----------|----------------------------|
| **Render** (web service) | Logs → retention duration; disable/limit request body logging if available |
| **Render Postgres** | Backups/snapshot retention; point-in-time recovery window |
| **Cloudflare R2** | Object lifecycle rules; version retention |
| **OpenAI** | Project settings → data retention / training controls for API key |

---

## COUNSEL / BUSINESS SETUP LATER

- OpenAI DPA and production data controls
- Liability and content license language
- Legal process / subpoena wording
- Final Terms and Privacy for public launch
- Business entity formation (if any) and operator naming on final docs
- CPRA/GDPR applicability if scope expands beyond invited U.S. 18+
