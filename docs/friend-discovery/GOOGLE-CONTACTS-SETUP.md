# Google Contacts discovery — required configuration (not secrets)

The app reads contacts only after OAuth with scope `https://www.googleapis.com/auth/contacts.readonly`. This is separate from Reelyou email/password auth.

## Required environment variable

- `EXPO_PUBLIC_GOOGLE_CLIENT_ID` — OAuth 2.0 **Web client** ID (or platform client IDs for native builds)

## Google Cloud Console (you must configure)

1. Create or select a project.
2. Enable **Google People API**.
3. **APIs & Services → OAuth consent screen** — configure app name, support email, scopes including `.../auth/contacts.readonly`; add test users while in Testing mode.
4. **Credentials → OAuth 2.0 Client ID**:
   - **Web application** for Expo web: authorized JavaScript origins include `http://localhost:8081` (and your production web origin).
   - Authorized redirect URIs must include Expo’s redirect handler, e.g. `https://auth.expo.io/@YOUR_EXPO_USERNAME/reelyou` (exact value from Expo auth docs for your slug) and any custom scheme redirect used by the app.
5. For iOS/Android builds, create platform OAuth clients with matching bundle ID / SHA-1 as required by Google.

## Current code status

- `authorizeGoogleContactsReadOnly()` returns `unconfigured` when `EXPO_PUBLIC_GOOGLE_CLIENT_ID` is missing.
- Full OAuth token exchange + People API pagination is not wired in the client yet; until redirects are registered, the UI shows the blocker message instead of pretending sync works.

## Phone contacts on desktop web

Not available — browsers cannot access the device address book. Use invite link or username search instead.
