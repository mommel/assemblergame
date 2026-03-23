# AGENTS.md - Assembly RPG

## Projektübersicht
Browser-basiertes Assembly-Lern-RPG (React 18 + Vite).

## Wichtige Kontextinformationen für Agenten

### Architektur
```
App.jsx → Overworld.jsx (Welt-Navigation)
       → BattleIDE.jsx (Assembly-Kampf)

worldgen.js → erzeugt Feindpositionen + Pfad
map_data.js → 100×100 Terrain-Grid (statisch)
levels.js   → 30 Assembly-Puzzles
```

### Tile-Asset-Konvention
Alle Tiles: `src/assets/<typ>_<richtungen>.jpg`
- Richtungen = welche Nachbarn den gleichen Typ haben
- `n`=Nord, `s`=Süd, `w`=West, `o`=Ost
- Terrain `forest` → Prefix `wald`, `mountain` → `berg`

### Skills verfügbar
- `.agents/skills/browser_test.md` — Browser Testing mit Chrome

### Workflows verfügbar
- `.agents/workflows/tile_world_implementation.md` — Kachel-Welt Implementierung

### Kollisionsregeln (KRITISCH)
**Blockiert (nicht begehbar):** `meer`, `mountain`, `fluss`, `see`, `forest`
**Begehbar:** `grass`, `weg`

> ⚠️ `forest` blockiert die Bewegung — der Spieler kann nicht durch den Wald gehen!

### Sprite-System
Alle Spieler- und Gegner-Sprites sind **PNG-Dateien mit Transparenz**, die über Kacheln gelegt werden:
- **Spieler:** `hero.png` (stehend), `hero_n/s/w/o.png` (Richtung nach Bewegung)
- **Gegner:** `boss_1.png` (gerade Indices), `boss_2.png` (ungerade Indices)
- Sprites werden mit `objectFit: contain` über die Kachel skaliert

## Für Code-Änderungen
1. Immer Implementation Plan erstellen
2. Dev-Server starten: `npm run dev`
3. Browser prüfen: Console leer, Kacheln sichtbar
4. Screenshots erstellen

## Einschränkungen
- Keine neuen npm-Pakete ohne Genehmigung
- Asset-Dateien nicht verändern oder verschieben
- Viewport: 25×17 Kacheln à 32px
