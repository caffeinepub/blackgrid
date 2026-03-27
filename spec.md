# BLACKGRID

## Current State
App has tabs: intelligence, dashboard, shield, profile, registry, network, guards, watchlist, subscription. No family/kids safety feature exists. Tab type and nav arrays are defined in App.tsx.

## Requested Changes (Diff)

### Add
- New `family` tab in the nav and Tab type
- `FamilySafetyTab.tsx` component: bright, cartoon-like, colorful, happy design (completely different from the matte black BLACKGRID aesthetic — this is a kid-friendly zone)
- Features inside FamilySafetyTab:
  - Big colorful header: "FAMILY SAFETY ZONE" with stars/hearts emoji decorations
  - Kid Check-In button (large, round, bright green) — taps to send a "I'm safe!" check-in with GPS coordinates pre-filled into an SMS link to parent's number
  - Parent phone number input (saved to localStorage)
  - SOS Call Parent button (large, round, bright red/orange) — opens phone dialer to parent's number
  - 911 button (for real emergencies)
  - Safe Zones display — parent can add home/school addresses as safe zones with fun colored badges
  - Fun animated mascot or emoji character as header illustration (use CSS/emoji, no image generation needed)
  - Cheerful pastel backgrounds, rounded corners, bouncy cartoon font sizing, rainbow colored cards
  - "Kids Mode" toggle feel — entirely distinct from the dark BLACKGRID UI

### Modify
- App.tsx: add `family` to Tab type, NAV_TABS, and render the FamilySafetyTab component (free, no paywall)

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/components/FamilySafetyTab.tsx` with full cartoon colorful UI
2. Update App.tsx to add `family` tab to type, nav, and render logic
