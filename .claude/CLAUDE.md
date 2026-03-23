# CLAUDE.md - Assembly RPG Project

## Projektübersicht
Ein browser-basiertes Assembly RPG Spiel gebaut mit React + Vite. Der Spieler navigiert eine 100x100 Kacheln große Welt und löst Assembly-Puzzle-Kämpfe.

## Projektstruktur
```
src/
  assets/          # Tile-Bilder (JPG) - benannt mit <typ>_<richtungen>.jpg
  components/
    Overworld.jsx  # Weltkarte mit Kachel-Renderer und Spielerbewegung
    BattleIDE.jsx  # Assembly-Puzzle-Kampfsystem
  engine/
    worldgen.js    # Welt-Generierung, Pfade, Feindpositionen
    map_data.js    # 100x100 Karten-Grunddaten (mapBase)
    levels.js      # 30 Assembly-Puzzle-Level
    interpreter.js # Assembly-Interpreter
  App.jsx          # Haupt-App mit Routing zwischen Overworld und Battle
```

## Tile-System
- Terrain-Typen: `meer`, `fluss`, `grass`, `forest`, `mountain`, `weg`, `see`
- Asset-Präfixe: `meer_*`, `fluss_*`, `grass`, `berg_*`, `wald_*`, `weg_*`, `see`
- Richtungs-Suffixe: `n`, `s`, `w`, `o` (Nord, Süd, West, Ost)
- Beispiel: `wald_no.jpg` = Wald mit gleichem Typ im Norden und Osten

## Wichtige Konventionen
- Alle Asset-Pfade: `/src/assets/<name>.jpg`
- Spieler startet bei (5, 5)
- 30 Feinde auf dem Pfad verteilt
- Viewport: 25×17 Kacheln, jede 32×32 Pixel

## Tech Stack
- React 18 + Vite
- Vanilla CSS (kein Tailwind)
- Keine externe Spieler-Engine

## Dev-Server starten
\`\`\`
npm run dev
\`\`\`
