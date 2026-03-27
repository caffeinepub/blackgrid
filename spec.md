# BLACKGRID

## Current State
App has dashboard, watchlist, intelligence, shield, registry, network, guards, subscription, and profile tabs. No emergency services feature exists.

## Requested Changes (Diff)

### Add
- Floating SOS button (deep red, bottom-right corner) visible on every authenticated screen and on the landing page
- Emergency panel modal triggered by SOS button with quick-dial buttons: 911, SF Non-Emergency Police (415-553-0123), Crisis Text Line (text HOME to 741741), Admin Direct Message
- GPS coordinates display inside the emergency panel so user can relay location to dispatch
- Legal disclaimer inside panel: "This app does not replace 911. In life-threatening emergencies, always call 911 directly."

### Modify
- App.tsx: add SOSButton component and EmergencyPanel modal rendered globally (outside tab content)

### Remove
- Nothing

## Implementation Plan
1. Create SOSButton + EmergencyPanel as a single self-contained component (EmergencyServices.tsx)
2. Import and render it in App.tsx at the root level so it floats above all content
3. Panel shows 4 action buttons, GPS coords, and disclaimer
