# Welcome Screen visual baselines (DESIGN LOCKED)

PNG screenshots captured from `/welcome?qaPreview=1` at fixed viewports.

| File | Viewport |
|------|----------|
| `iphone-14.png` | 390 × 844 |
| `iphone-14-pro-max.png` | 430 × 932 |
| `desktop.png` | 1280 × 800 |

Do not replace unless product explicitly approves a Welcome visual change.

Refresh (maintainers only):

```bash
UPDATE_WELCOME_BASELINE=1 WELCOME_PREVIEW_URL=http://127.0.0.1:8090/welcome?qaPreview=1 npm run test:welcome-visual
```

See `docs/design-lock/WELCOME_SCREEN_v1_LOCKED.md`.
