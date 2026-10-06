# Render Beta deploy checklist

After merging server changes, redeploy the Render service and set:

- `DATABASE_URL` — Postgres connection string
- `AUTH_JWT_SECRET` — at least 32 characters
- `FRIEND_MATCH_PEPPER` — at least 32 characters
- `MEDIA_STORAGE=s3` plus R2/S3 credentials (Beta media)
- `APP_ORIGIN` — HTTPS URL where the app loads (password reset links)
- `CORS_ORIGIN` — include your Expo web / production app origins
- **Password reset (required for Beta):**
  - `RESEND_API_KEY` — recommended, or
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`
  - `EMAIL_FROM` — verified sender (e.g. `REELYOU <hello@yourdomain.com>`)

Verify after deploy:

1. `GET /health` — `authConfigured` and `mediaStorageConfigured` true
2. `POST /v1/auth/password/forgot` with a registered email returns `{ ok, accountFound: true, maskedEmail }` — **not** `emailConfigured: false`
3. `GET /v1/profile/me` with Bearer token returns profile + `onboardingComplete`

Do not commit secret values to the repository.
