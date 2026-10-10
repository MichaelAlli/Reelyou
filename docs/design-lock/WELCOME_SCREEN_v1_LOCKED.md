# REELYOU Welcome Screen — DESIGN LOCKED 🔒

**Status:** FINAL · APPROVED · PRODUCTION  
**Version:** v1.0  
**Checkpoint commit:** `a972955eff7adc6b2721c85624e912f6b67938e9`  
**Component:** `src/screens/WelcomeScreen.tsx`  
**Route:** `/welcome` (QA: `/welcome?qaPreview=1` from [QA Gallery](/qa/screens))

## Preserved exactly

- REELYOU logo lockup (`reelyou-welcome-logo-white-tagline-cropped.png`) and positioning  
- Tagline and description typography (`WelcomeCopy`, `BodyText`)  
- Decorative star / divider (in approved logo artwork)  
- Vertical and horizontal spacing (hero center region + optical offset)  
- **START YOUR JOURNEY** and **SIGN IN** controls  
- Background artwork (`welcome-background.jpg`), constellation ring, sunrise and mountains  
- Mobile proportions and current responsive helpers in `welcomeForegroundLayout.ts`  
- Cinematic dark treatment — **no global post-Welcome theme on this route**

## Rules for engineering

1. Do **not** redesign or reposition Welcome elements during unrelated work.  
2. Do **not** change styles, assets, or layout without explicit product approval.  
3. If a task appears to require Welcome visual changes — **stop** and request approval first.  
4. Do **not** change production routing or authentication behavior on Welcome without approval.  
5. Bug fixes and non-visual viewport/safe-area fixes are allowed if the approved look is unchanged.

## Regression protection

| Layer | Command / location |
|--------|----------------------|
| Structural lock test | `npx tsx src/screens/welcomeDesignLock.test.ts` |
| Routing & composition | `npx tsx src/screens/welcomeScreenRouting.test.ts` |
| Layout math | `npx tsx src/constants/welcomeForegroundLayout.test.ts` |
| Viewport acceptance | `npx tsx src/constants/welcomeWebLayoutAcceptance.test.ts` |
| Screenshot baselines | `npm run test:welcome-visual` |
| Cursor rule | `.cursor/rules/approved-splash-welcome-locked.mdc` |

### Visual baselines

PNG references under `test/visual-baselines/welcome/`:

- `iphone-14.png` — 390×844  
- `iphone-14-pro-max.png` — 430×932  
- `desktop.png` — 1280×800  

Regenerate only with explicit approval:

```bash
npx expo export -p web && npx serve dist -p 8090
# one-time browser install for visual tests:
npx playwright install chromium
UPDATE_WELCOME_BASELINE=1 WELCOME_PREVIEW_URL=http://127.0.0.1:8090/welcome?qaPreview=1 npm run test:welcome-visual
```

## Git rollback

Tag reference: **Welcome v1.0 Design Lock** (see header in `WelcomeScreen.tsx`).
