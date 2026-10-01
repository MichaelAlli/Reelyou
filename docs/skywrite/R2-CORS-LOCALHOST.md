# R2 CORS for local Skywrite media upload

When `EXPO_PUBLIC_REELYOU_API` points at Render and media uploads use presigned **PUT** URLs to Cloudflare R2, the browser must pass a CORS preflight from your dev origin (e.g. `http://localhost:8081`).

## Symptoms

- Skywrite publish fails after selecting photo/video on web
- Network tab: PUT to `*.r2.cloudflarestorage.com` blocked by CORS
- App error: media upload failed (see `formatSkywriteServerSyncError`)

## Fix (Cloudflare dashboard)

1. Open **R2** → your media bucket → **Settings** → **CORS policy**.
2. Add a rule allowing your dev origin:

```json
[
  {
    "AllowedOrigins": ["http://localhost:8081", "http://127.0.0.1:8081"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

3. Add production web origins when you deploy (HTTPS only).
4. Redeploy is **not** required on Render for CORS-only changes; allow a few minutes for R2 policy propagation.

## Verify

1. Sign in on web with a **test account**.
2. Compose a photo Skywrite → preview shows media → publish.
3. Confirm `POST /v1/media/upload-sessions`, successful PUT to R2, then `POST .../complete`, then `POST /v1/content/skywrites`.
