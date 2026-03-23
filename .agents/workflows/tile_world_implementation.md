---
description: workflow for implementing and testing tile-based world rendering in the Assembly RPG
---

# Tile World Implementation Workflow

## 1. Understand the Asset Structure
Review `src/assets/` — tiles are named `<type>_<directions>.jpg` where:
- **type**: `grass`, `berg`, `fluss`, `meer`, `wald`, `weg`, `see`
- **directions**: combination of `n`, `s`, `w`, `o` (Nord, Süd, West, Ost) indicating which adjacent tiles share the same type

Example: `wald_no.jpg` = forest tile with forest to the north and east (Ost).

## 2. Understand the Map Data
`src/engine/map_data.js` exports `mapBase` — a 100x100 grid using these terrain types:
- `meer` = ocean/sea
- `fluss` = river
- `grass` = grassland
- `forest` = forest (rendered as `wald_*` tiles)
- `mountain` = mountain (rendered as `berg_*` tiles)
- `weg` = path/road
- `see` = inland lake

## 3. Code Changes
Edit `src/components/Overworld.jsx`:
- Fix `getTileImage()` to correctly map terrain type → asset prefix
- Fix direction suffix computation (N/S/W/O means neighbor has same type)
- Add player sprite overlay (centered emoji/icon on player tile)
- Add enemy sprite overlay

## 4. Start Dev Server
```
cd c:\Users\msxbo\Documents\SANDBOX\assemblergame
npm run dev
```

// turbo

## 5. Browser Testing
Open Chrome to `http://localhost:5173` or whatever port vite is using.
- Check browser console for errors (F12 → Console tab)
- Verify tiles render as images, not colored circles
- Verify map has ocean border, grass/forest interior, paths

## 6. Screenshot
Use browser subagent to capture screenshots of:
- Initial world view (player at spawn)
- A section with river tiles
- A section with mountain tiles
