# BLACKGRID

## Current State
Full-featured luxury security app with Dashboard, Intelligence, Watchlist, Route Defense, Registry, Profile, Network, Guards, Subscription tabs. LandingPage component exists. App.tsx is the main entry point.

## Requested Changes (Diff)

### Add
- TutorialOverlay.tsx: A step-by-step interactive tutorial (7 steps) launched from a "HOW IT WORKS" button on the landing page. Uses Web Speech API (window.speechSynthesis) to narrate each step. Controls: PLAY, PAUSE, NEXT, PREV, CLOSE. Progress bar. Steps cover: Welcome, Dashboard/Threat Map, Intelligence Feed, Route Defense, Sex Offender Registry, Guards/Black Tier, Profile/Identity Badge. Matte black + gold BLACKGRID branding.
- Public shareable URL: Landing page is accessible at root without login.

### Modify
- LandingPage.tsx: Add HOW IT WORKS button that opens TutorialOverlay.
- App.tsx: Ensure root route shows LandingPage without auth gate.

### Remove
- Nothing.

## Implementation Plan
1. Create TutorialOverlay.tsx component with voice narration and step navigation.
2. Add HOW IT WORKS button to LandingPage.
3. Verify App.tsx root route is publicly accessible.
