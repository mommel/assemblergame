import React, { useMemo } from 'react';

// ─── Tile Images (same as Overworld) ─────────────────────────────────────────
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

// ─── Boss Sprites ─────────────────────────────────────────────────────────────
import imgBoss1 from '../assets/boss_01.png';
import imgBoss2 from '../assets/boss_02.png';
import imgBoss3 from '../assets/boss_03.png';
import imgBoss4 from '../assets/boss_04.png';
import imgBoss5 from '../assets/boss_05.png';
import imgBoss6 from '../assets/boss_06.png';
import imgBoss7 from '../assets/boss_07.png';
import imgBoss8 from '../assets/boss_08.png';
import imgBoss9 from '../assets/boss_09.png';
import imgBoss10 from '../assets/boss_10.png';
import imgBoss11 from '../assets/boss_11.png';
import imgBoss12 from '../assets/boss_12.png';
import imgBoss13 from '../assets/boss_13.png';
import imgBoss14 from '../assets/boss_14.png';
import imgBoss15 from '../assets/boss_15.png';
import imgBoss16 from '../assets/boss_16.png';
import imgBoss17 from '../assets/boss_17.png';
import imgBoss18 from '../assets/boss_18.png';
import imgBoss19 from '../assets/boss_19.png';
import imgBoss20 from '../assets/boss_20.png';
import imgBoss21 from '../assets/boss_21.png';
import imgBoss22 from '../assets/boss_22.png';
import imgBoss23 from '../assets/boss_23.png';
import imgBoss24 from '../assets/boss_24.png';
import imgBoss25 from '../assets/boss_25.png';
import imgBoss26 from '../assets/boss_26.png';
import imgBoss27 from '../assets/boss_27.png';
import imgBoss28 from '../assets/boss_28.png';
import imgBoss29 from '../assets/boss_29.png';
import imgBoss30 from '../assets/boss_30.png';
import imgHero from '../assets/hero.png';

export const BOSS_SPRITES = [imgBoss1, imgBoss2, imgBoss3, imgBoss4, imgBoss5, imgBoss6, imgBoss7, imgBoss8, imgBoss9, imgBoss10, imgBoss11, imgBoss12, imgBoss13, imgBoss14, imgBoss15, imgBoss16, imgBoss17, imgBoss18, imgBoss19, imgBoss20, imgBoss21, imgBoss22, imgBoss23, imgBoss24, imgBoss25, imgBoss26, imgBoss27, imgBoss28, imgBoss29, imgBoss30];
export const getBossSprite = (enemyIdx) => BOSS_SPRITES[enemyIdx % BOSS_SPRITES.length];

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

const MAP_WIDTH = 100;
const MAP_HEIGHT = 100;
const OVERVIEW_TILE_SIZE = 8;

const getTileAt = (grid, x, y) => {
  if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return 'meer';
  return grid[y][x];
};

const getTileImage = (grid, x, y, type) => {
  if (type === 'grass') return TILE_MAP['grass'];
  if (type === 'see') return TILE_MAP['see'];
  let baseName;
  switch (type) {
    case 'forest': baseName = 'wald'; break;
    case 'mountain': baseName = 'berg'; break;
    case 'meer': baseName = 'meer'; break;
    case 'fluss': baseName = 'fluss'; break;
    case 'weg': baseName = 'weg'; break;
    default: return TILE_MAP['grass'];
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

export const WorldOverview = ({ mapGrid, playerPos, levels, currentLevelIndex, onClose }) => {
  // Build enemy lookup
  const enemyMap = useMemo(() => {
    const m = {};
    levels.forEach((l, idx) => { m[`${l.mapProps.x},${l.mapProps.y}`] = idx; });
    return m;
  }, [levels]);

  // Pre-compute all tile images Row by Row for performance
  const rows = useMemo(() => {
    const result = [];
    for (let y = 0; y < MAP_HEIGHT; y++) {
      const row = [];
      for (let x = 0; x < MAP_WIDTH; x++) {
        const type = getTileAt(mapGrid, x, y);
        row.push({ x, y, type, img: getTileImage(mapGrid, x, y, type) });
      }
      result.push(row);
    }
    return result;
  }, [mapGrid]);

  const S = OVERVIEW_TILE_SIZE;
  const totalW = MAP_WIDTH * S;
  const totalH = MAP_HEIGHT * S;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', maxWidth: `${totalW}px` }}>
        <h2 className="text-glow" style={{ margin: 0, flex: 1 }}>🗺️ Weltkarte — Komplette Übersicht</h2>
        <button onClick={onClose} style={{ background: '#1e293b', border: '1px solid #334155', color: '#94a3b8' }}>
          ← Zurück zum Spiel
        </button>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', gap: '1rem', flexWrap: 'wrap',
        fontSize: '11px', color: '#94a3b8',
        maxWidth: `${totalW}px`, width: '100%',
      }}>
        {[
          { color: '#4ade80', name: 'Gras' },
          { color: '#166534', name: 'Wald' },
          { color: '#9ca3af', name: 'Berg' },
          { color: '#3b82f6', name: 'Meer' },
          { color: '#60a5fa', name: 'Fluss' },
          { color: '#d97706', name: 'Weg' },
          { color: '#2563eb', name: 'See' },
        ].map(({ color, name }) => (
          <span key={name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 10, height: 10, background: color, display: 'inline-block', borderRadius: 2 }} />
            {name}
          </span>
        ))}
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: 10, height: 10, background: '#ef4444', display: 'inline-block', borderRadius: '50%' }} />
          Gegner
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: 10, height: 10, background: '#38bdf8', display: 'inline-block', borderRadius: '50%' }} />
          Spieler
        </span>
      </div>

      {/* The full world rendered with real tile images */}
      <div style={{
        position: 'relative',
        width: `${totalW}px`,
        height: `${totalH}px`,
        flexShrink: 0,
        border: '3px solid #334155',
        borderRadius: '4px',
        imageRendering: 'pixelated',
      }}>
        {/* Render tiles as a grid of images */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${MAP_WIDTH}, ${S}px)`,
          gridTemplateRows: `repeat(${MAP_HEIGHT}, ${S}px)`,
          width: `${totalW}px`,
          height: `${totalH}px`,
        }}>
          {rows.map(row =>
            row.map(cell => (
              <img
                key={`${cell.x}-${cell.y}`}
                src={cell.img}
                alt=""
                style={{ width: `${S}px`, height: `${S}px`, display: 'block', objectFit: 'cover', imageRendering: 'pixelated' }}
              />
            ))
          )}
        </div>

        {/* Enemy markers overlaid */}
        {levels.map((l, idx) => {
          const defeated = idx < currentLevelIndex;
          return (
            <div
              key={`enemy-${idx}`}
              title={`${l.name} (${l.mapProps.x}, ${l.mapProps.y})`}
              style={{
                position: 'absolute',
                left: `${l.mapProps.x * S}px`,
                top: `${l.mapProps.y * S}px`,
                width: `${S}px`,
                height: `${S}px`,
                background: defeated ? 'rgba(16,185,129,0.7)' : 'rgba(239,68,68,0.8)',
                borderRadius: '50%',
                border: `1px solid ${defeated ? '#10b981' : '#ef4444'}`,
                zIndex: 10,
              }}
            />
          );
        })}

        {/* Player marker */}
        <div style={{
          position: 'absolute',
          left: `${playerPos.x * S - S / 2}px`,
          top: `${playerPos.y * S - S / 2}px`,
          width: `${S * 2}px`,
          height: `${S * 2}px`,
          background: 'rgba(56,189,248,0.9)',
          borderRadius: '50%',
          border: '2px solid #38bdf8',
          boxShadow: '0 0 8px rgba(56,189,248,0.8)',
          zIndex: 20,
        }} />
      </div>

      <p style={{ color: '#475569', fontSize: '12px' }}>
        Spieler bei ({playerPos.x}, {playerPos.y}) · {totalW}×{totalH}px · {MAP_WIDTH}×{MAP_HEIGHT} Kacheln
      </p>
    </div>
  );
};
