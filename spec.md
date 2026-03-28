# BLACKGRID

## Current State
- LiveMap.tsx: Static SVG with fake grid, hardcoded threat dots, no real streets, no GPS
- ShieldTab.tsx (Route Defense): Static SVG grid map, simulated GPS, no real streets
- DashboardTab.tsx: Uses LiveMap component
- FamilySafetyTab.tsx: Child safety mode, shares app chrome with main BLACKGRID tabs

## Requested Changes (Diff)

### Add
- Leaflet.js + react-leaflet dependency for real map rendering
- Real OpenStreetMap tile layer (free, no API key) in LiveMap and ShieldTab
- Live GPS geolocation using browser Geolocation API showing a pulsing "YOU" dot on both maps
- Threat markers at real SF lat/lng coordinates with popup tooltips showing: threat type, neighborhood, severity, description
- Threat detail panel below/beside map listing all active threats with color-coded severity
- A visual separator/banner making FAMILY tab look entirely different from main app (already has cartoon UI, but ensure nav and header clearly differentiate it — e.g. hide the dark BLACKGRID header when in FAMILY tab, show colorful family header instead)

### Modify
- LiveMap.tsx: Replace entire SVG implementation with real Leaflet map centered on SF (37.7749, -122.4194), zoom 13, OpenStreetMap tiles, dark tile style or standard OSM, threat markers with popups, GPS "YOU" marker
- ShieldTab.tsx: Replace SVG map section with real Leaflet map, keep GPS tracking/recalculation logic, show route on real map using polyline between start/end coords, show danger zone circles at real SF crime hotspot coordinates
- FamilySafetyTab.tsx: Ensure it renders its own colorful header (rainbow/bright) instead of the main BLACKGRID gold header when active, clearly separated visually from the dark theme

### Remove
- All static SVG city block / grid / fake street label code in LiveMap.tsx and ShieldTab.tsx map section

## Implementation Plan
1. Install leaflet, react-leaflet, and @types/leaflet via package.json
2. Rewrite LiveMap.tsx using MapContainer, TileLayer, CircleMarker, Popup, useMap hook for GPS centering
3. Real SF threat coordinates (Mission District, Tenderloin, SoMa, Western Addition, Bayview, etc.)
4. Each threat marker has popup with: name, severity badge, neighborhood, offense type, description
5. Threat detail list panel below map (scrollable, color-coded red/yellow/green)
6. In ShieldTab.tsx: replace SVG map div with Leaflet MapContainer, show route as Polyline, danger zones as Circles
7. GPS centering: useEffect with navigator.geolocation.watchPosition to update map center and "YOU" marker
8. FamilySafetyTab: ensure its own bright header/banner renders when family tab active (already mostly done — verify and enforce)
