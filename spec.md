# BLACKGRID

## Current State
Sex Offender Registry is live with 12 entries and a static header. Family Safety Tab has PIN lock only around parent settings — the main tab content is visible to anyone without any PIN entry.

## Requested Changes (Diff)

### Add
- Registry: Daily update timestamp in header showing today's date with animated pulse dot
- Family Tab: Full entry-gate PIN screen BEFORE any content. Two modes: CHILD MODE (PIN default 1234, shows only I'M SAFE, CALL PARENT, CALL 911, Safety Tips) and PARENT MODE (existing PIN, shows everything including settings)

### Modify
- FamilySafetyTab.tsx: Add locked/child/parent viewMode state with lock gate screen
- OffenderRegistry.tsx: Add daily update badge to header

### Remove
Nothing

## Implementation Plan
1. OffenderRegistry.tsx: Add dynamic today date display near the registry subheader
2. FamilySafetyTab.tsx: Add viewMode state (locked/child/parent). Locked = colorful gate with CHILD ENTRY and PARENT ENTRY buttons. Child PIN stored as bg_child_pin default 1234. Child view hides all parent/settings controls. Lock button visible in child view to re-lock.
