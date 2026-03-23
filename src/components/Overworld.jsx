import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { generateWorld } from '../engine/worldgen';
import { getBossSprite } from './WorldOverview';

// ─── Tile Images ──────────────────────────────────────────────────────────────
const assetModules = import.meta.glob('../assets/*.{jpg,png}', { eager: true, import: 'default' });

export const TILE_MAP = {};
const HERO_SPRITES = {};

for (const path in assetModules) {
  const filename = path.split('/').pop().split('.')[0];
  const imgUrl = assetModules[path];
  
  // Separate hero sprites from terrain tiles
  if (filename.startsWith('hero')) {
    if (filename === 'hero') HERO_SPRITES['idle'] = imgUrl;
    else HERO_SPRITES[filename.replace('hero_', '')] = imgUrl;
  } else if (!filename.startsWith('boss') && filename !== 'title') {
    TILE_MAP[filename] = imgUrl;
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────
// 12 wide × 8 tall tiles at 64px — retro chunky look
export const VIEW_COLS = 12;
export const VIEW_ROWS = 8;
export const TILE_SIZE = 64;
export const MAP_WIDTH = 100;
export const MAP_HEIGHT = 100;

export const isWalkable = (tileType) => {
  if (!tileType) return false;
  return tileType === 'grass' || tileType.startsWith('weg');
};

export const getTileAt = (grid, x, y) => {
  if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return 'meer';
  return grid[y][x];
};

export const getTileId = (grid, x, y, type) => {
  if (TILE_MAP[type]) return type;
  if (type === 'see') return TILE_MAP['see'] ? 'see' : 'grass';

  let baseName;
  switch (type) {
    case 'forest':   baseName = 'wald'; break;
    case 'mountain': baseName = 'berg'; break;
    case 'meer':     baseName = 'meer'; break;
    case 'fluss':    baseName = 'fluss'; break;
    case 'weg':      baseName = 'weg'; break;
    default:         return 'grass';
  }
  
  const isSameType = (nx, ny) => {
    const neighbor = getTileAt(grid, nx, ny);
    return neighbor === type || neighbor === baseName || neighbor.startsWith(baseName + '_');
  };

  let suffix = '';
  if (isSameType(x, y - 1)) suffix += 'n';
  if (isSameType(x, y + 1)) suffix += 's';
  if (isSameType(x - 1, y)) suffix += 'w';
  if (isSameType(x + 1, y)) suffix += 'o';
  
  const exactKey = suffix === '' ? baseName : `${baseName}_${suffix}`;
  if (TILE_MAP[exactKey]) return exactKey;
  
  const candidates = Object.keys(TILE_MAP).filter(k => k === baseName || k.startsWith(baseName + '_'));
  if (!candidates.length) return 'grass';
  
  let best = candidates[0], bestScore = -999;
  for (const key of candidates) {
    const ks = key.includes('_') ? key.split('_').slice(1).join('') : '';
    let score = 0;
    for (const ch of suffix) { if (ks.includes(ch)) score += 1; }
    for (const ch of ks) { if (!suffix.includes(ch)) score -= 0.5; }
    if (score > bestScore) { bestScore = score; best = key; }
  }
  return best;
};

export const getTileImage = (grid, x, y, type) => {
  const finalId = getTileId(grid, x, y, type);
  return TILE_MAP[finalId] || TILE_MAP['grass'];
};

// BFS pathfinding for auto-play
const bfsNextStep = (grid, sx, sy, tx, ty) => {
  if (sx === tx && sy === ty) return null;
  const key = (x, y) => y * MAP_WIDTH + x;
  const visited = new Set([key(sx, sy)]);
  const queue = [{ x: sx, y: sy, path: [] }];
  const dirs = [{ dx: 0, dy: -1, dir: 'n' }, { dx: 0, dy: 1, dir: 's' }, { dx: -1, dy: 0, dir: 'w' }, { dx: 1, dy: 0, dir: 'o' }];
  while (queue.length) {
    const { x, y, path } = queue.shift();
    for (const { dx, dy, dir } of dirs) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || nx >= MAP_WIDTH || ny < 0 || ny >= MAP_HEIGHT) continue;
      if (visited.has(key(nx, ny))) continue;
      const isTarget = nx === tx && ny === ty;
      if (!isTarget && !isWalkable(grid[ny]?.[nx])) continue;
      const newPath = [...path, { x: nx, y: ny, dir }];
      if (isTarget) return newPath[0] || null;
      visited.add(key(nx, ny));
      queue.push({ x: nx, y: ny, path: newPath });
    }
  }
  return null;
};

// ─── Component ────────────────────────────────────────────────────────────────
export const Overworld = ({
  levels, currentLevelIndex, onEncounter, autoPlay,
  onShowWorldMap, playerPos, onPlayerMove,
}) => {
  const [heroDir, setHeroDir] = useState('idle');
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
    if (!isWalkable(getTileAt(mapGrid, nextX, nextY))) return;
    setHeroDir(dir);
    const posBeforeMove = { ...playerPos };
    onPlayerMove({ x: nextX, y: nextY });
    // Trigger encounter for ANY undefeated boss the player steps on
    const stepKey = `${nextX},${nextY}`;
    const bossIdx = enemyMap[stepKey];
    if (bossIdx !== undefined && bossIdx >= currentLevelIndex) {
      onEncounter(levels[bossIdx], posBeforeMove, bossIdx);
    }
  }, [playerPos, mapGrid, currentLevelIndex, levels, enemyMap, onEncounter, onPlayerMove]);

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

  useEffect(() => {
    if (!autoPlay || !currentLevel) return;
    const interval = setInterval(() => {
      const tx = currentLevel.mapProps.x, ty = currentLevel.mapProps.y;
      if (playerPos.x === tx && playerPos.y === ty) {
        onEncounter(currentLevel, playerPos, currentLevelIndex);
        return;
      }
      const next = bfsNextStep(mapGrid, playerPos.x, playerPos.y, tx, ty);
      if (!next) return;
      setHeroDir(next.dir);
      const posBeforeMove = { ...playerPos };
      onPlayerMove({ x: next.x, y: next.y });
      if (next.x === tx && next.y === ty) onEncounter(currentLevel, posBeforeMove, currentLevelIndex);
    }, 80);
    return () => clearInterval(interval);
  }, [autoPlay, currentLevel, currentLevelIndex, playerPos, mapGrid, onEncounter, onPlayerMove]);

  const renderViewport = () => {
    const cells = [];
    const camX = playerPos.x - Math.floor(VIEW_COLS / 2);
    const camY = playerPos.y - Math.floor(VIEW_ROWS / 2);

    for (let row = 0; row < VIEW_ROWS; row++) {
      for (let col = 0; col < VIEW_COLS; col++) {
        const wx = camX + col, wy = camY + row;
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
              <img src={getBossSprite(enemyIdx)} alt="enemy" style={{
                position: 'absolute', top: '-8px', left: '-8px',
                width: `${TILE_SIZE + 16}px`, height: `${TILE_SIZE + 16}px`,
                objectFit: 'contain', imageRendering: 'pixelated', zIndex: 5,
                filter: isActiveEnemy ? 'drop-shadow(0 0 8px rgba(239,68,68,0.9))' : 'drop-shadow(0 0 4px rgba(251,191,36,0.6))',
                animation: isActiveEnemy ? 'bounce-enemy 1s infinite' : 'none',
              }} />
            )}
            {isEnemy && isDefeated && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px', zIndex: 5,
              }}>✅</div>
            )}
            {isPlayer && (
              <img src={HERO_SPRITES[heroDir]} alt="player" style={{
                position: 'absolute', top: '-12px', left: '-6px',
                width: `${TILE_SIZE + 12}px`, height: `${TILE_SIZE + 24}px`,
                objectFit: 'contain', imageRendering: 'pixelated', zIndex: 10,
                filter: 'drop-shadow(0 0 8px rgba(56,189,248,0.9))',
              }} />
            )}
          </div>
        );
      }
    }
    return cells;
  };

  const viewportW = VIEW_COLS * TILE_SIZE;
  const viewportH = VIEW_ROWS * TILE_SIZE;

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
      {/* Game viewport */}
      <div
        id="overworld-viewport"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${VIEW_COLS}, ${TILE_SIZE}px)`,
          gridTemplateRows: `repeat(${VIEW_ROWS}, ${TILE_SIZE}px)`,
          width: `${viewportW}px`,
          height: `${viewportH}px`,
          overflow: 'hidden',
          border: '4px solid #334155',
          backgroundColor: '#0b1120',
          imageRendering: 'pixelated',
          flexShrink: 0,
        }}
      >
        {renderViewport()}
      </div>

      {/* Right info panel */}
      <div style={{
        width: '200px',
        height: `${viewportH}px`,
        background: '#0f172a',
        border: '4px solid #334155',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px',
        gap: '12px',
        boxSizing: 'border-box',
        flexShrink: 0,
      }}>
        {/* Hero portrait */}
        <img src={HERO_SPRITES.idle} alt="Hero" style={{
          width: '80px', height: '80px',
          objectFit: 'contain', imageRendering: 'pixelated',
          filter: 'drop-shadow(0 0 8px rgba(56,189,248,0.6))',
        }} />

        <div style={{ width: '100%', borderTop: '1px solid #334155', paddingTop: '10px' }}>
          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aktuelles Ziel</div>
          <div style={{ fontSize: '12px', color: '#93c5fd', lineHeight: 1.4, wordBreak: 'break-word' }}>
            {currentLevel ? currentLevel.name : '🎉 Spiel komplett gelöst!'}
          </div>
        </div>

        <div style={{ width: '100%', borderTop: '1px solid #334155', paddingTop: '10px' }}>
          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Position</div>
          <div style={{ fontSize: '13px', color: '#38bdf8', fontFamily: 'monospace' }}>
            {playerPos.x}, {playerPos.y}
          </div>
        </div>

        <div style={{ marginTop: 'auto', width: '100%', borderTop: '1px solid #334155', paddingTop: '10px' }}>
          <div style={{ fontSize: '10px', color: '#475569', lineHeight: 1.6 }}>
            <div>WASD / ↑↓←→ Bewegen</div>
            <div>M — Weltkarte</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce-enemy {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
};
