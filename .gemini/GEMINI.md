# GEMINI.md - Assembly RPG

## Projektbeschreibung
Browser-basiertes Assembly-Lern-RPG (React/Vite). Spieler navigiert eine 100×100 Kachel-Welt und kämpft gegen Gegner durch Assembly-Code-Puzzles.

## Wichtigste Dateien
- `src/components/Overworld.jsx` — Weltkarte, Kachel-Renderer, Spielerbewegung
- `src/components/BattleIDE.jsx` — Assembly-IDE und Kampfsystem
- `src/engine/worldgen.js` — Prozedurale Welt-Generierung
- `src/engine/map_data.js` — 100×100 Terrain-Grid (`mapBase`)
- `src/engine/levels.js` — 30 Assembly-Puzzle-Level

## Tile-System (KRITISCH)
Terrain-Typen im Grid → Asset-Präfixe in `/src/assets/`:
- `grass` → `grass.jpg`
- `forest` → `wald_<richtungen>.jpg`
- `mountain` → `berg_<richtungen>.jpg`
- `meer` → `meer_<richtungen>.jpg`
- `fluss` → `fluss_<richtungen>.jpg`
- `weg` → `weg_<richtungen>.jpg`
- `see` → `see.jpg`

Richtungs-Suffix: `n/s/w/o` für Nachbarn mit gleichem Terrain-Typ

## Kollisionsregeln
Blockiert (nicht begehbar): `mountain`, `meer`, `fluss`, `see`, **`forest`**
Begehbar: `grass`, `weg`

> ⚠️ Wald (`forest`) **blockiert** den Spieler — kein Durchgehen durch Wälder!

## Sprite-System
- Spieler: `hero.png` (idle) + `hero_n/s/w/o.png` (Richtung) — PNG mit Transparenz
- Gegner: `boss_1.png` / `boss_2.png` abwechselnd — PNG mit Transparenz
- Sprites als Overlay über Kacheln (position: absolute)

## Dev-Befehle
```bash
npm run dev    # Entwicklungsserver starten
npm run build  # Produktion bauen
```

## Browser-Test
Nach Code-Änderungen: Browser öffnen → `http://localhost:5173`
- F12 Konsole auf Fehler prüfen
- Kacheln müssen als Bilder erscheinen, nicht als Farb-Kreise
