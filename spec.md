# BLACKGRID

## Current State
New project. No existing application files.

## Requested Changes (Diff)

### Add
- Full BLACKGRID personal security intelligence web application
- Live Grid Map dashboard with simulated risk zones (red/yellow/green pulsing markers)
- Security Score gauge (radial/ring progress, 0-100, dynamic based on area)
- Threat Alerts panel with critical/active/warning counts
- Identity Scan screen (QR-based consent scanning with verified profile display)
- Watchlist system: add/tag/note people as Safe/Unknown/Avoid with interaction logs
- Route Defense mode: map with safer path suggestion, avoidance zones
- Threat Alert full-screen interruption flow
- User authentication and profile creation (verified identity, trust level)
- Subscription tier display: Free / Elite ($79/mo) / BLACK ($500+/mo)
- Live alert ticker showing recent incidents (simulated public feed)
- Navigation: Intelligence, Dashboard, Shield, Reports, Watchlist
- Landing/marketing page with hero, feature cards, pricing tiers

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend: User profiles with verification level, watchlist entries (tag + notes + interaction history), threat alerts feed, security score calculation, subscription tiers
2. Frontend: Multi-page app with nav, landing hero, live map dashboard, watchlist CRUD, identity scan UI, threat alert overlay, route defense view, pricing page
3. Map: Canvas/SVG-based dark map with animated pulsing zone markers (no external API dependency)
4. Components: authorization (user accounts), qr-code (identity scan), invite-links (Black tier invite-only access)
