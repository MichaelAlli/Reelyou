# StarPath cloud progress — additive migration (Beta)

**Status:** Design approved; **do not run production migrations without owner sign-off.**

## Storage model

- Field: `StoredUser.starpathProgressSnapshot` (JSON object on the user row inside `reellyou_app_state.payload`).
- Postgres: same JSONB blob as accounts — **no separate SQL table** required for Beta.
- File DB (`REELYOU_DB_PATH`): persisted with existing account save.

## Schema (`STARPATH_PROGRESS_SNAPSHOT_VERSION = 1`)

- `resources.savedResourceIds`, `dismissedResourceIds`, `snoozedResourceUntil`
- `settledMilestoneIds`
- `emotional.supportState`, `userReportedLabel`
- `journeySignals` — cached structured AI extraction (`sourceHash`, arrays)

## API

- `GET|PUT /v1/starpath/progress/me` (auth required)
- `GET /v1/starpath/journey-signals/me` (auth required; uses `allowAIContext` + non-private Skywrites only)

## Rollback

- Omit reading/writing the field in a hotfix client/server.
- Existing users without the field behave as empty snapshot.

## Deploy order

1. Deploy **backend** with new routes.
2. Deploy **frontend** that hydrates/syncs progress.
3. Verify two-session saved-opportunity continuity on staging.
