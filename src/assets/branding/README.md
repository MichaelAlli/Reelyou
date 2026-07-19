# REELYOU — Approved Brand Assets

This folder contains the **approved, production REELYOU brand artwork** used by the cinematic Splash and Welcome screens and by shared UI via `BrandLogo`.

## Splash Screen (locked)

| Role | Canonical path |
|------|----------------|
| Full-screen splash artwork | `assets/images/splash-approved.png` |
| Celestial reference | `assets/images/splash-celestial-background.png` |
| Screen implementation | `src/screens/SplashScreen.tsx` |
| Asset registry | `src/constants/splashAssets.ts` |

The splash logo is **baked into** `splash-approved.png`. Do not overlay a separate logo component on top of the approved artwork.

## Welcome Screen (locked)

| Role | Canonical path |
|------|----------------|
| Welcome background | `src/assets/backgrounds/welcome-background.jpg` |
| Transparent Welcome logo (source) | `src/assets/branding/reelyou-welcome-logo-white-tagline.png` |
| Transparent Welcome logo (rendered) | `src/assets/branding/reelyou-welcome-logo-white-tagline-cropped.png` |
| Screen implementation | `src/screens/WelcomeScreen.tsx` |
| Asset registry | `src/constants/branding.ts` → `BrandingAssets.welcomeLogoWhiteTaglineCropped` |

The Welcome screen renders the **cropped RGBA PNG** to remove excess transparent canvas padding below the artwork. The uncropped source file is retained as the approved master.

## Shared brand logos (UI)

| File | Use |
|------|-----|
| `reelyou-logo-light-no-tagline.png` | UI on dark backgrounds |
| `reelyou-logo-dark-no-tagline.png` | UI on light backgrounds |
| `reelyou-logo-light-with-tagline.png` | Marketing lockup on dark backgrounds |
| `reelyou-logo-dark-with-tagline.png` | Marketing lockup on light backgrounds |
| `reelyou-icon.png` | Icon-only contexts |

Always render logos through `src/components/branding/BrandLogo.tsx` and `src/constants/branding.ts`.

## Permanent rules

1. **Splash and Welcome are permanently dark/cinematic.** They must not follow global theme-based asset switching or light-mode recoloring.
2. **Do not replace transparent PNG assets with JPEGs** (including files saved with a `.png` extension but encoded as JPEG).
3. **Do not add backgrounds, cards, boxes, or theme surfaces** behind the Welcome logo. It must remain a transparent PNG over the sky background.
4. **Do not redesign** approved logo size, spacing, composition, background framing, CTAs, or navigation without explicit user approval.
5. **Do not depend on external paths** (Downloads, chat attachments, OneDrive links outside the repo). All required assets must live in this repository.

## Welcome logo verification checklist

The approved Welcome logo must be:

- True PNG, RGBA, with transparent corners
- No baked dark rectangle behind the wordmark
- REELYOU wordmark with white/light letters and gold **YOU**
- White tagline: *SHARE. GROW. CONTRIBUTE. BECOME.*
