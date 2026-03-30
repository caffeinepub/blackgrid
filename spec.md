# BLACKGRID — OSIRIS OSINT Platform

## Current State
OSINT tab exists with matrix terminal UI, TOP SECRET splash, and 5 tools (person lookup, digital footprint, breach status, threat dossier, business intel). Breach status uses HaveIBeenPwned and Wikipedia APIs. Data is cached 24 hours.

## Requested Changes (Diff)

### Add
- Rename the OSINT portal internally to **OSIRIS** (Operational Signal Intelligence & Reconnaissance Information System)
- New **OSIRIS** branding: classified header, mission badge, codename system
- **IP/Domain Intelligence Tool**: Real WHOIS lookup via whoisjson.com free API; real IP geolocation via ipinfo.io free tier; AbuseIPDB confidence score via public endpoint
- **Threat Actor Monitor**: Real news monitoring via public RSS/NewsAPI feeds filtered by person/entity name; shows recent news hits with source links
- **Network Exposure Scanner**: Enter domain/IP and get real DNS records, WHOIS owner, hosting provider, country, ASN — all from live APIs
- **Enhanced Breach Scanner**: Full HaveIBeenPwned v3 API with breach name, date, data types exposed, logo, and severity rating per breach
- **OSINT Summary Panel**: AI-style analysis card that aggregates all scan results and produces a structured threat summary (risk level, key findings, recommended actions) — computed from real data
- All results labeled LIVE DATA or CACHED (24hr) with timestamp
- Results are never fabricated — if an API fails, show the error clearly with retry button

### Modify
- OSINT tab label remains OSINT but portal header shows OSIRIS branding
- Terminal UI stays (matrix green, monospace, scanlines)
- Person Profile tool now shows Wikipedia summary + real news hits + digital exposure score computed from actual API responses
- Breach Status shows per-breach detail cards instead of single badge
- Digital Footprint uses real API call counts to compute score

### Remove
- All hardcoded/simulated fallback data that pretends to be real — replace with honest "no data found" states
- Fake business intel data — replace with real WHOIS/domain lookups

## Implementation Plan
1. Create OsirisPortal component with OSIRIS branding header
2. Implement real WHOIS/IP tool using fetch to whoisjson.com and ipinfo.io
3. Enhance breach scanner with full HIBP v3 breach details per entry
4. Implement news monitor using RSS-to-JSON proxy (rss2json.com) with Google News RSS
5. Build OSINT Summary aggregator that reads all tool results and outputs structured intel report
6. Replace all simulated fallback data with honest empty/error states
7. Ensure all API calls are cached in localStorage for 24 hours with timestamp
