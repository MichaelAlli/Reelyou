# Checkpoint — Welcome Screen v1.0 design lock

**Date:** 2026-10-10  
**Branch:** `feature/post-welcome-theme-system`  
**Baseline commit (composition):** `a972955eff7adc6b2721c85624e912f6b67938e9`  
**Lock commit:** (this checkpoint — see git log)

## Scope

Official freeze of the approved Welcome Screen. No visual changes without product sign-off.

## Verification

```bash
npm run test:welcome
npx expo export -p web
# With preview server on :8090 or static dist:
npm run test:welcome-visual
```

## Visual baselines

`test/visual-baselines/welcome/*.png` — iPhone 14, iPhone 14 Pro Max, desktop.
