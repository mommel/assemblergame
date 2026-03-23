import React, { useEffect, useMemo, useCallback } from 'react';
import { generateWorld } from '../engine/worldgen';
import { getBossSprite } from './WorldOverview';

// ─── Tile Images ──────────────────────────────────────────────────────────────
import imgGrass from '../assets/grass.jpg';
import imgSee from '../assets/see.jpg';
import imgBerg from '../assets/berg.jpg';
import imgBerg_n from '../assets/berg_n.jpg';
import imgBerg_no from '../assets/berg_no.jpg';
import imgBerg_ns from '../assets/berg_ns.jpg';
import imgBerg_nso from '../assets/berg_nso.jpg';
import imgBerg_nsw from '../assets/berg_nsw.jpg';
import imgBerg_nw from '../assets/berg_nw.jpg';
import imgBerg_nwo from '../assets/berg_nwo.jpg';
import imgBerg_o from '../assets/berg_o.jpg';
import imgBerg_s from '../assets/berg_s.jpg';
import imgBerg_so from '../assets/berg_so.jpg';
import imgBerg_sw from '../assets/berg_sw.jpg';
import imgBerg_swo from '../assets/berg_swo.jpg';
import imgBerg_w from '../assets/berg_w.jpg';
import imgBerg_wo from '../assets/berg_wo.jpg';
import imgFluss_no from '../assets/fluss_no.jpg';
import imgFluss_ns from '../assets/fluss_ns.jpg';
import imgFluss_nswo from '../assets/fluss_nswo.jpg';
import imgFluss_nw from '../assets/fluss_nw.jpg';
import imgFluss_so from '../assets/fluss_so.jpg';
import imgFluss_sw from '../assets/fluss_sw.jpg';
import imgFluss_wo from '../assets/fluss_wo.jpg';
import imgMeer_no from '../assets/meer_no.jpg';
import imgMeer_nso from '../assets/meer_nso.jpg';
import imgMeer_nsw from '../assets/meer_nsw.jpg';
import imgMeer_nswo from '../assets/meer_nswo.jpg';
import imgMeer_nw from '../assets/meer_nw.jpg';
import imgMeer_nwo from '../assets/meer_nwo.jpg';
import imgMeer_so from '../assets/meer_so.jpg';
import imgMeer_sw from '../assets/meer_sw.jpg';
import imgMeer_swo from '../assets/meer_swo.jpg';
import imgWald_n from '../assets/wald_n.jpg';
import imgWald_no from '../assets/wald_no.jpg';
import imgWald_nswo from '../assets/wald_nswo.jpg';
import imgWald_nw from '../assets/wald_nw.jpg';
import imgWald_s from '../assets/wald_s.jpg';
import imgWald_so from '../assets/wald_so.jpg';
import imgWald_swo from '../assets/wald_swo.jpg';
import imgWeg_no from '../assets/weg_no.jpg';
import imgWeg_ns from '../assets/weg_ns.jpg';
import imgWeg_nso from '../assets/weg_nso.jpg';
import imgWeg_nsw from '../assets/weg_nsw.jpg';
import imgWeg_nswo from '../assets/weg_nswo.jpg';
import imgWeg_nw from '../assets/weg_nw.jpg';
import imgWeg_nwo from '../assets/weg_nwo.jpg';
import imgWeg_so from '../assets/weg_so.jpg';
import imgWeg_sw from '../assets/weg_sw.jpg';
import imgWeg_swo from '../assets/weg_swo.jpg';
import imgWeg_wo from '../assets/weg_wo.jpg';

// ─── Hero Sprites ─────────────────────────────────────────────────────────────
import imgHero from '../assets/hero.png';
import imgHero_n from '../assets/hero_n.png';
import imgHero_s from '../assets/hero_s.png';
import imgHero_w from '../assets/hero_w.png';
import imgHero_o from '../assets/hero_o.png';

const HERO_SPRITES = { idle: imgHero, n: imgHero_n, s: imgHero_s, w: imgHero_w, o: imgHero_o };

// ─── Tile Lookup ──────────────────────────────────────────────────────────────
const TILE_MAP = {
  grass: imgGrass, see: imgSee,
  berg: imgBerg, berg_n: imgBerg_n, berg_no: imgBerg_no, berg_ns: imgBerg_ns,
  berg_nso: imgBerg_nso, berg_nsw: imgBerg_nsw, berg_nw: imgBerg_nw,
  berg_nwo: imgBerg_nwo, berg_o: imgBerg_o, berg_s: imgBerg_s, berg_so: imgBerg_so,
  berg_sw: imgBerg_sw, berg_swo: imgBerg_swo, berg_w: imgBerg_w, berg_wo: imgBerg_wo,
  fluss_no: imgFluss_no, fluss_ns: imgFluss_ns, fluss_nswo: imgFluss_nswo,
  fluss_nw: imgFluss_nw, fluss_so: imgFluss_so, fluss_sw: imgFluss_sw, fluss_wo: imgFluss_wo,
  meer_no: imgMeer_no, meer_nso: imgMeer_nso, meer_nsw: imgMeer_nsw,
  meer_nswo: imgMeer_nswo, meer_nw: imgMeer_nw, meer_nwo: imgMeer_nwo,
  meer_so: imgMeer_so, meer_sw: imgMeer_sw, meer_swo: imgMeer_swo,
  wald_n: imgWald_n, wald_no: imgWald_no, wald_nswo: imgWald_nswo,
  wald_nw: imgWald_nw, wald_s: imgWald_s, wald_so: imgWald_so, wald_swo: imgWald_swo,
  weg_no: imgWeg_no, weg_ns: imgWeg_ns, weg_nso: imgWeg_nso, weg_nsw: imgWeg_nsw,
  weg_nswo: imgWeg_nswo, weg_nw: imgWeg_nw, weg_nwo: imgWeg_nwo,
  weg_so: imgWeg_so, weg_sw: imgWeg_sw, weg_swo: imgWeg_swo, weg_wo: imgWeg_wo,
};

const VIEW_COLS = 25;
const VIEW_ROWS = 17;
const TILE_SIZE = 32;
const MAP_WIDTH = 100;
const MAP_HEIGHT = 100;

// Blocked tiles — forest AND mountain AND meer AND fluss AND see block movement
const BLOCKED_TILES = new Set(['meer', 'mountain', 'fluss', 'see', 'forest']);

const getTileAt = (grid, x, y) => {
  if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return 'meer';
  return grid[y][x];
};

const getTileImage = (grid, x, y, type) => {
  if (type === 'grass') return TILE_MAP['grass'];
  if (type === 'see') return TILE_MAP['see'];
  let baseName;
  switch (type) {
    case 'forest':   baseName = 'wald'; break;
    case 'mountain': baseName = 'berg'; break;
    case 'meer':     baseName = 'meer'; break;
    case 'fluss':    baseName = 'fluss'; break;
    case 'weg':      baseName = 'weg'; break;
    default:         return TILE_MAP['grass'];
  }
  let suffix = '';
  if (getTileAt(grid, x, y - 1) === type) suffix += 'n';
  if (getTileAt(grid, x, y + 1) === type) suffix += 's';
  if (getTileAt(grid, x - 1, y) === type) suffix += 'w';
  if (getTileAt(grid, x + 1, y) === type) suffix += 'o';
  const exactKey = suffix === '' ? baseName : `${baseName}_${suffix}`;
  if (TILE_MAP[exactKey]) return TILE_MAP[exactKey];
  const candidates = Object.keys(TILE_MAP).filter(k => k === baseName || k.startsWith(baseName + '_'));
  if (!candidates.length) return TILE_MAP['grass'];
  let best = candidates[0], bestScore = -999;
  for (const key of candidates) {
    const ks = key.includes('_') ? key.split('_').slice(1).join('') : '';
    let score = 0;
    for (const ch of suffix) { if (ks.includes(ch)) score += 1; }
    for (const ch of ks) { if (!suffix.includes(ch)) score -= 0.5; }
    if (score > bestScore) { bestScore = score; best = key; }
  }
  return TILE_MAP[best] || TILE_MAP['grass'];
};

// ─── BFS Pathfinding ──────────────────────────────────────────────────────────
// Returns the next step {x,y} to move from (sx,sy) toward (tx,ty) avoiding blocked tiles.
// Returns null if no path found (target unreachable).
const bfsNextStep = (grid, sx, sy, tx, ty) => {
  if (sx === tx && sy === ty) return null;

  const key = (x, y) => y * MAP_WIDTH + x;
  const visited = new Set();
  const queue = [{ x: sx, y: sy, path: [] }];
  visited.add(key(sx, sy));

  const dirs = [
    { dx: 0, dy: -1, dir: 'n' },
    { dx: 0, dy:  1, dir: 's' },
    { dx: -1, dy: 0, dir: 'w' },
    { dx:  1, dy: 0, dir: 'o' },
  ];

  while (queue.length > 0) {
    const { x, y, path } = queue.shift();

    for (const { dx, dy, dir } of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= MAP_WIDTH || ny < 0 || ny >= MAP_HEIGHT) continue;
      if (visited.has(key(nx, ny))) continue;

      const t = grid[ny][nx];
      // Allow movement to the target even if it's blocked-type (can stand adjacent to boss tile)
      const isTarget = nx === tx && ny === ty;
      if (!isTarget && BLOCKED_TILES.has(t)) continue;

      const newPath = [...path, { x: nx, y: ny, dir }];
      if (isTarget) {
        // Return first step of the path
        return newPath.length > 0 ? newPath[0] : null;
      }

      visited.add(key(nx, ny));
      queue.push({ x: nx, y: ny, path: newPath });
    }
  }
  return null; // No path found
};

// ─── Main Component ───────────────────────────────────────────────────────────
// playerPos and onPlayerMove are controlled from App.jsx so position persists across battles
export const Overworld = ({
  levels,
  currentLevelIndex,
  onEncounter,
  autoPlay,
  onShowWorldMap,
  playerPos,
  onPlayerMove,
}) => {
  // heroDir is local — purely visual, doesn't need to survive battle
  const [heroDir, setHeroDir] = React.useState('idle');

  const currentLevel = levels[currentLevelIndex];
  const { grid: mapGrid } = useMemo(() => generateWorld(), []);

  const enemyMap = useMemo(() => {
    const m = {};
    levels.forEach((l, idx) => { m[`${l.mapProps.x},${l.mapProps.y}`] = idx; });
    return m;
  }, [levels]);

  const tryMove = useCallback((dx, dy, dir) => {
    const nextX = playerPos.x + dx;
    const nextY = playerPos.y + dy;
    if (nextX < 0 || nextX >= MAP_WIDTH || nextY < 0 || nextY >= MAP_HEIGHT) return;
    if (BLOCKED_TILES.has(getTileAt(mapGrid, nextX, nextY))) return;
    setHeroDir(dir);
    onPlayerMove({ x: nextX, y: nextY });
    if (currentLevel && nextX === currentLevel.mapProps.x && nextY === currentLevel.mapProps.y) {
      onEncounter(currentLevel);
    }
  }, [playerPos, mapGrid, currentLevel, onEncounter, onPlayerMove]);

  // ── Keyboard movement ──
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowUp'    || e.key === 'w') { e.preventDefault(); tryMove(0, -1, 'n'); }
      if (e.key === 'ArrowDown'  || e.key === 's') { e.preventDefault(); tryMove(0,  1, 's'); }
      if (e.key === 'ArrowLeft'  || e.key === 'a') { e.preventDefault(); tryMove(-1, 0, 'w'); }
      if (e.key === 'ArrowRight' || e.key === 'd') { e.preventDefault(); tryMove( 1, 0, 'o'); }
      if (e.key === 'm' || e.key === 'M') onShowWorldMap();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [tryMove, onShowWorldMap]);

  // ── Auto-play with BFS pathfinding ──
  useEffect(() => {
    if (!autoPlay || !currentLevel) return;

    const interval = setInterval(() => {
      const tx = currentLevel.mapProps.x;
      const ty = currentLevel.mapProps.y;

      // Check if we're already at the enemy
      if (playerPos.x === tx && playerPos.y === ty) {
        onEncounter(currentLevel);
        return;
      }

      // BFS to find next step toward enemy
      const next = bfsNextStep(mapGrid, playerPos.x, playerPos.y, tx, ty);
      if (!next) {
        // No path found — try to walk adjacent to the target instead
        return;
      }

      setHeroDir(next.dir);
      onPlayerMove({ x: next.x, y: next.y });

      // Check encounter after move
      if (next.x === tx && next.y === ty) {
        onEncounter(currentLevel);
      }
    }, 80); // Slightly faster for smoother auto-play

    return () => clearInterval(interval);
  }, [autoPlay, currentLevel, playerPos, mapGrid, onEncounter, onPlayerMove]);

  const renderViewport = () => {
    const cells = [];
    const camX = playerPos.x - Math.floor(VIEW_COLS / 2);
    const camY = playerPos.y - Math.floor(VIEW_ROWS / 2);

    for (let row = 0; row < VIEW_ROWS; row++) {
      for (let col = 0; col < VIEW_COLS; col++) {
        const wx = camX + col;
        const wy = camY + row;
        const cellType = getTileAt(mapGrid, wx, wy);
        const tileImg = getTileImage(mapGrid, wx, wy, cellType);
        const isPlayer = wx === playerPos.x && wy === playerPos.y;
        const enemyIdx = enemyMap[`${wx},${wy}`];
        const isEnemy = enemyIdx !== undefined;
        const isActiveEnemy = isEnemy && currentLevel && levels[enemyIdx]?.id === currentLevel.id;
        const isDefeated = isEnemy && enemyIdx < currentLevelIndex;

        cells.push(
          <div key={`${wx}-${wy}`} style={{
            position: 'relative', width: `${TILE_SIZE}px`, height: `${TILE_SIZE}px`,
            padding: 0, margin: 0, lineHeight: 0, flexShrink: 0,
          }}>
            <img src={tileImg} alt="" style={{
              width: `${TILE_SIZE}px`, height: `${TILE_SIZE}px`,
              objectFit: 'cover', display: 'block', imageRendering: 'pixelated',
            }} />

            {isEnemy && !isDefeated && (
              <img
                src={getBossSprite(enemyIdx)}
                alt="enemy"
                style={{
                  position: 'absolute', top: '-4px', left: '-4px',
                  width: `${TILE_SIZE + 8}px`, height: `${TILE_SIZE + 8}px`,
                  objectFit: 'contain', imageRendering: 'pixelated', zIndex: 5,
                  filter: isActiveEnemy
                    ? 'drop-shadow(0 0 5px rgba(239,68,68,0.9))'
                    : 'drop-shadow(0 0 3px rgba(251,191,36,0.6))',
                  animation: isActiveEnemy ? 'bounce-enemy 1s infinite' : 'none',
                }}
              />
            )}
            {isEnemy && isDefeated && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', zIndex: 5,
              }}>✅</div>
            )}

            {isPlayer && (
              <img
                src={HERO_SPRITES[heroDir]}
                alt="player"
                style={{
                  position: 'absolute', top: '-8px', left: '-4px',
                  width: `${TILE_SIZE + 8}px`, height: `${TILE_SIZE + 16}px`,
                  objectFit: 'contain', imageRendering: 'pixelated', zIndex: 10,
                  filter: 'drop-shadow(0 0 6px rgba(56,189,248,0.8))',
                }}
              />
            )}
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div className="retro-container p-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2 className="text-glow mb-2">Virenland - Große Welt</h2>
      <p className="mb-2 text-sm" style={{ color: '#94a3b8' }}>
        WASD / Pfeiltasten: Bewegen &nbsp;|&nbsp;
        <kbd style={{ background: '#1e293b', padding: '0 4px', borderRadius: 3 }}>M</kbd>: Weltkarte
      </p>

      <button
        id="world-map-btn"
        onClick={onShowWorldMap}
        style={{ marginBottom: '0.5rem', background: '#1e3a5f', border: '1px solid #3b82f6', color: '#93c5fd' }}
      >
        🗺️ Weltkarte anzeigen
      </button>

      <div
        id="overworld-viewport"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${VIEW_COLS}, ${TILE_SIZE}px)`,
          gridTemplateRows: `repeat(${VIEW_ROWS}, ${TILE_SIZE}px)`,
          overflow: 'hidden',
          border: '4px solid #334155',
          backgroundColor: '#0b1120',
          imageRendering: 'pixelated',
        }}
      >
        {renderViewport()}
      </div>

      <div className="mt-4 text-center">
        <p><strong>Aktuelles Ziel:</strong> {currentLevel ? currentLevel.name : '🎉 Spiel komplett gelöst!'}</p>
        <p style={{ fontSize: '12px', color: '#64748b' }}>Koordinaten: {playerPos.x}, {playerPos.y}</p>
      </div>

      <style>{`
        @keyframes bounce-enemy {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
};
