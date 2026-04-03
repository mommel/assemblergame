import React, { useState, useEffect, useCallback, useRef } from 'react';
import { VIEW_COLS, VIEW_ROWS, TILE_SIZE, MAP_WIDTH, MAP_HEIGHT, getTileAt, getTileImage, getTileId, TILE_MAP } from './Overworld';
import { getBossSprite } from './WorldOverview';

const BASE_CATEGORIES = [
  { label: 'Grass', generic: 'grass', prefix: 'grass' },
  { label: 'See', generic: 'see', prefix: 'see' },
  { label: 'Bäume / Wald', generic: 'forest', prefix: 'wald' },
  { label: 'Berge', generic: 'mountain', prefix: 'berg' },
  { label: 'Meer', generic: 'meer', prefix: 'meer' },
  { label: 'Fluss', generic: 'fluss', prefix: 'fluss' },
  { label: 'Weg', generic: 'weg', prefix: 'weg' },
  { label: 'Boss', generic: 'boss_00', prefix: 'boss' }
];

const getStructuredCategories = () => {
  const cats = [];
  
  BASE_CATEGORIES.forEach(cat => {
    const orientMap = {};
    
    if (cat.prefix === 'boss') {
      const versions = [];
      for (let i = 0; i < 30; i++) {
        const padded = i < 10 ? `0${i}` : `${i}`;
        versions.push({ id: `boss_${padded}`, label: `Boss Level ${i+1}` });
      }
      orientMap['default'] = versions;
    } else {
      const keys = Object.keys(TILE_MAP).filter(k => k === cat.prefix || k.startsWith(cat.prefix + '_'));
      
      keys.forEach(k => {
         const parts = k.split('_');
         let orientation = 'default';
         let version = 'default';
         if (parts.length > 1) {
            const match = parts[1].match(/^([a-z]*)(\d*)$/);
            if (match) {
               orientation = match[1] || 'default';
               version = match[2] || 'default';
            } else {
               version = parts[1];
            }
         }
         
         if (!orientMap[orientation]) orientMap[orientation] = [];
         orientMap[orientation].push({ id: k, label: version === 'default' ? 'Standard' : `Var ${version}` });
      });
      
      if (!orientMap['default']) {
        orientMap['default'] = [{ id: cat.generic, label: 'Standard (Auto)' }];
      } else if (!orientMap['default'].some(v => v.id === cat.generic)) {
        orientMap['default'].unshift({ id: cat.generic, label: 'Standard (Auto)' });
      }
    }
    
    const orientations = Object.entries(orientMap).map(([orient, versions]) => ({
       id: orient,
       label: orient === 'default' ? 'Ohne Richtung' : orient.toUpperCase(),
       versions: versions.sort((a,b) => a.id.localeCompare(b.id))
    })).sort((a,b) => a.id === 'default' ? -1 : (b.id === 'default' ? 1 : a.id.localeCompare(b.id)));
    
    cats.push({
      label: cat.label,
      prefix: cat.prefix,
      generic: cat.generic,
      orientations
    });
  });
  
  return cats;
};

const CATEGORIES = getStructuredCategories();

export const MapEditor = ({ initialGrid, initialBosses = {}, isGenerated }) => {
  const [grid, setGrid] = useState(initialGrid);
  const [bosses, setBosses] = useState(() => {
    const cleanBosses = {};
    for (const [k, v] of Object.entries(initialBosses || {})) {
      const p = parseInt(k, 10);
      if (!isNaN(p)) {
        const pad = p < 10 ? `0${p}` : `${p}`;
        cleanBosses[pad] = v;
      }
    }
    // ensure alphabetical order "00", "01"...
    return Object.keys(cleanBosses).sort().reduce((acc, key) => { acc[key] = cleanBosses[key]; return acc; }, {});
  });

  const [cursorPos, setCursorPos] = useState({ x: 5, y: 5 });
  const [panelMode, setPanelMode] = useState('closed'); // 'closed', 'type', 'orientation', 'version'
  const [selectedTypeIdx, setSelectedTypeIdx] = useState(0);
  const [selectedOrientIdx, setSelectedOrientIdx] = useState(0);
  const [selectedVersIdx, setSelectedVersIdx] = useState(0);
  
  const [saving, setSaving] = useState(false);
  const panelRef = useRef(null);
  const activeTileRefs = useRef({});

  useEffect(() => {
    setGrid(initialGrid);
    setBosses(initialBosses);
  }, [initialGrid, initialBosses]);

  const saveMap = async (newGrid, newBosses) => {
    setSaving(true);
    try {
      await fetch('/api/save-map', {
        method: 'POST',
        body: JSON.stringify({ grid: newGrid, bosses: newBosses })
      });
    } catch (e) {
      console.error("Failed to save map", e);
    }
    setSaving(false);
  };

  const handleKeyDown = useCallback((e) => {
    if (panelMode === 'closed') {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        const activeTileId = grid[cursorPos.y][cursorPos.x];
        
        let foundType = 0, foundOrient = 0, foundVers = 0;
        let found = false;
        
        for (let t = 0; t < CATEGORIES.length; t++) {
           for (let o = 0; o < CATEGORIES[t].orientations.length; o++) {
              for (let v = 0; v < CATEGORIES[t].orientations[o].versions.length; v++) {
                 if (CATEGORIES[t].orientations[o].versions[v].id === activeTileId) {
                    foundType = t; foundOrient = o; foundVers = v;
                    found = true;
                    break;
                 }
              }
              if (found) break;
           }
           if (found) break;
        }

        if (!found) {
           const prefix = activeTileId.split('_')[0];
           const idx = CATEGORIES.findIndex(c => c.prefix === prefix || c.prefix === 'wald' && prefix === 'forest'); 
           if (idx !== -1) foundType = idx;
        }

        setSelectedTypeIdx(foundType);
        setSelectedOrientIdx(foundOrient);
        setSelectedVersIdx(foundVers);
        
        setPanelMode('type');
        return;
      }
      let dx = 0, dy = 0;
      if (e.key === 'ArrowUp' || e.key === 'w') dy = -1;
      if (e.key === 'ArrowDown' || e.key === 's') dy = 1;
      if (e.key === 'ArrowLeft' || e.key === 'a') dx = -1;
      if (e.key === 'ArrowRight' || e.key === 'd') dx = 1;

      if (dx !== 0 || dy !== 0) {
        setCursorPos(prev => ({
          x: Math.max(0, Math.min(MAP_WIDTH - 1, prev.x + dx)),
          y: Math.max(0, Math.min(MAP_HEIGHT - 1, prev.y + dy))
        }));
      }
    } else if (panelMode === 'type') {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setPanelMode('orientation');
        setSelectedOrientIdx(0);
        return;
      }
      if (e.key === 'Backspace') {
        e.preventDefault();
        setPanelMode('closed');
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'w') {
        setSelectedTypeIdx(prev => (prev > 0 ? prev - 1 : CATEGORIES.length - 1));
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        setSelectedTypeIdx(prev => (prev < CATEGORIES.length - 1 ? prev + 1 : 0));
      }
    } else if (panelMode === 'orientation') {
      const activeType = CATEGORIES[selectedTypeIdx];
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setPanelMode('version');
        setSelectedVersIdx(0);
        return;
      }
      if (e.key === 'Backspace') {
        e.preventDefault();
        setPanelMode('type');
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'w') {
        setSelectedOrientIdx(prev => (prev > 0 ? prev - 1 : activeType.orientations.length - 1));
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        setSelectedOrientIdx(prev => (prev < activeType.orientations.length - 1 ? prev + 1 : 0));
      }
    } else if (panelMode === 'version') {
      const activeVersions = CATEGORIES[selectedTypeIdx].orientations[selectedOrientIdx].versions;
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        const tileId = activeVersions[selectedVersIdx].id;
        if (tileId.startsWith('boss_')) {
          const bossId = tileId.split('_')[1];
          const newBosses = { ...bosses, [bossId]: { x: cursorPos.x, y: cursorPos.y } };
          // Ensure predictable sorting logic on every key placement
          const sortedBosses = Object.keys(newBosses).sort().reduce((acc, key) => {
             acc[key] = newBosses[key];
             return acc;
          }, {});
          setBosses(sortedBosses);
          saveMap(grid, sortedBosses);
        } else {
          const newGrid = grid.map(row => [...row]);
          newGrid[cursorPos.y][cursorPos.x] = tileId;
          setGrid(newGrid);
          saveMap(newGrid, bosses);
        }
        setPanelMode('closed');
        return;
      }
      if (e.key === 'Backspace') {
        e.preventDefault();
        setPanelMode('orientation');
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'w') {
        setSelectedVersIdx(prev => (prev > 0 ? prev - 1 : activeVersions.length - 1));
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        setSelectedVersIdx(prev => (prev < activeVersions.length - 1 ? prev + 1 : 0));
      }
    }
  }, [panelMode, selectedTypeIdx, selectedOrientIdx, selectedVersIdx, grid, cursorPos]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (panelMode !== 'closed') {
      let activeIdx = 0;
      if (panelMode === 'type') activeIdx = selectedTypeIdx;
      else if (panelMode === 'orientation') activeIdx = selectedOrientIdx;
      else if (panelMode === 'version') activeIdx = selectedVersIdx;
      
      const el = activeTileRefs.current[activeIdx];
      if (el && panelRef.current) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedTypeIdx, selectedOrientIdx, selectedVersIdx, panelMode]);

  const renderViewport = () => {
    const cells = [];
    const camX = cursorPos.x - Math.floor(VIEW_COLS / 2);
    const camY = cursorPos.y - Math.floor(VIEW_ROWS / 2);

    for (let row = 0; row < VIEW_ROWS; row++) {
      for (let col = 0; col < VIEW_COLS; col++) {
        const wx = camX + col, wy = camY + row;
        const cellType = getTileAt(grid, wx, wy);
        const tileImg = getTileImage(grid, wx, wy, cellType);
        const isCursor = wx === cursorPos.x && wy === cursorPos.y;

        let bossSprite = null;
        for (const [bId, bPos] of Object.entries(bosses)) {
           if (bPos.x === wx && bPos.y === wy) {
               bossSprite = getBossSprite(parseInt(bId, 10));
               break;
           }
        }

        cells.push(
          <div key={`${wx}-${wy}`} style={{
            position: 'relative', width: `${TILE_SIZE}px`, height: `${TILE_SIZE}px`,
            padding: 0, margin: 0, lineHeight: 0, flexShrink: 0,
          }}>
            <img src={tileImg} alt="" style={{
              width: `${TILE_SIZE}px`, height: `${TILE_SIZE}px`,
              objectFit: 'cover', display: 'block', imageRendering: 'pixelated',
            }} />
            {bossSprite && (
              <img src={bossSprite} alt="boss" style={{
                position: 'absolute', top: '-8px', left: '-8px',
                width: `${TILE_SIZE + 16}px`, height: `${TILE_SIZE + 16}px`,
                objectFit: 'contain', imageRendering: 'pixelated', zIndex: 5,
              }} />
            )}
            {isCursor && (
              <div style={{
                position: 'absolute', top: 0, left: 0,
                width: '100%', height: '100%',
                boxShadow: 'inset 0 0 0 2px #fde047, 0 0 10px 4px rgba(253, 224, 71, 0.8)',
                zIndex: 20, pointerEvents: 'none'
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

  const renderPanelItems = () => {
    if (panelMode === 'type') {
      return CATEGORIES.map((cat, idx) => {
        const isActive = selectedTypeIdx === idx;
        const img = cat.prefix === 'boss' ? getBossSprite(0) : getTileImage(grid, 0, 0, cat.generic);
        return (
          <div 
            key={`type-${idx}`} 
            ref={el => activeTileRefs.current[idx] = el}
            style={{
              padding: '8px 12px',
              backgroundColor: isActive ? '#334155' : 'transparent',
              borderLeft: isActive ? '3px solid #fde047' : '3px solid transparent',
              color: isActive ? '#fde047' : '#cbd5e1',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
          }}>
            <img src={img} alt={cat.label} style={{ width: '28px', height: '28px', objectFit: 'contain', imageRendering: 'pixelated', borderRadius: '4px' }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {cat.label} ({cat.orientations.length} Richtg.)
            </span>
          </div>
        );
      });
    }

    if (panelMode === 'orientation') {
      const activeType = CATEGORIES[selectedTypeIdx];
      return [
        <div key="header-orient" style={{
          padding: '8px 12px 4px', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold'
        }}>
          {activeType.label} - Richtung
        </div>,
        ...activeType.orientations.map((orient, idx) => {
          const isActive = selectedOrientIdx === idx;
          const firstVer = orient.versions[0];
          const img = activeType.prefix === 'boss' ? getBossSprite(0) : getTileImage(grid, 0, 0, firstVer.id);
          return (
            <div 
              key={`orient-${idx}`} 
              ref={el => activeTileRefs.current[idx] = el}
              style={{
                padding: '6px 12px',
                backgroundColor: isActive ? '#334155' : 'transparent',
                borderLeft: isActive ? '3px solid #fde047' : '3px solid transparent',
                color: isActive ? '#fde047' : '#cbd5e1',
                fontSize: '14px',
                display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <img src={img} alt={orient.label} style={{ width: '24px', height: '24px', objectFit: 'contain', imageRendering: 'pixelated', borderRadius: '4px' }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {orient.label} ({orient.versions.length})
              </span>
            </div>
          );
        })
      ];
    }

    if (panelMode === 'version') {
      const activeType = CATEGORIES[selectedTypeIdx];
      const activeOrient = activeType.orientations[selectedOrientIdx];
      return [
        <div key="header-vers" style={{
          padding: '8px 12px 4px', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold'
        }}>
          {activeType.label} - {activeOrient.label} - Var
        </div>,
        ...activeOrient.versions.map((ver, idx) => {
          const isActive = selectedVersIdx === idx;
          const img = activeType.prefix === 'boss' ? getBossSprite(parseInt(ver.id.split('_')[1], 10)) : getTileImage(grid, 0, 0, ver.id);
          return (
            <div 
              key={`vers-${idx}`} 
              ref={el => activeTileRefs.current[idx] = el}
              style={{
                padding: '6px 12px',
                backgroundColor: isActive ? '#334155' : 'transparent',
                borderLeft: isActive ? '3px solid #fde047' : '3px solid transparent',
                color: isActive ? '#fde047' : '#cbd5e1',
                fontSize: '14px',
                display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <img src={img} alt={ver.label} style={{ width: '24px', height: '24px', objectFit: 'contain', imageRendering: 'pixelated', borderRadius: '4px' }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {ver.label}
              </span>
            </div>
          );
        })
      ];
    }

    return null;
  };

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', height: `${viewportH}px` }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${VIEW_COLS}, ${TILE_SIZE}px)`,
          gridTemplateRows: `repeat(${VIEW_ROWS}, ${TILE_SIZE}px)`,
          width: `${viewportW}px`,
          height: `${viewportH}px`,
          overflow: 'hidden',
          border: '4px solid #fde047',
          backgroundColor: '#0b1120',
          imageRendering: 'pixelated',
          flexShrink: 0,
        }}
      >
        {renderViewport()}
      </div>

      <div style={{
        width: '260px',
        height: '100%',
        background: '#0f172a',
        border: `4px solid ${panelMode !== 'closed' ? '#fde047' : '#334155'}`,
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '12px', borderBottom: '1px solid #334155' }}>
          <h2 style={{ color: '#fde047', fontSize: '16px', margin: '0 0 8px 0', textAlign: 'center' }}>Map Editor</h2>
          <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
            Pos: {cursorPos.x}, {cursorPos.y}
            {saving && <span style={{ color: '#ef4444', marginLeft: '8px' }}>Saving...</span>}
          </div>
        </div>

        <div ref={panelRef} style={{ flex: 1, overflowY: 'auto', padding: '8px 0', display: panelMode === 'closed' ? 'none' : 'block' }}>
          {renderPanelItems()}
        </div>
        
        {panelMode === 'closed' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '12px', padding: '20px', textAlign: 'center' }}>
            Drücke Space um den Typ zu wählen.
          </div>
        )}

        <div style={{ padding: '12px', borderTop: '1px solid #334155', background: '#0b1120' }}>
          <div style={{ fontSize: '10px', color: '#64748b', lineHeight: 1.6 }}>
            {panelMode === 'closed' && (
              <>
                <div><span style={{color:'#fde047'}}>WASD</span>: Cursor bewegen</div>
                <div><span style={{color:'#fde047'}}>Space</span>: Typauswahl öffnen</div>
              </>
            )}
            {panelMode === 'type' && (
              <>
                <div><span style={{color:'#fde047'}}>WASD</span>: Typ wählen</div>
                <div><span style={{color:'#fde047'}}>Space</span>: Richtung anzeigen</div>
                <div><span style={{color:'#fde047'}}>Backspace</span>: Schließen</div>
              </>
            )}
            {panelMode === 'orientation' && (
              <>
                <div><span style={{color:'#fde047'}}>WASD</span>: Richtung wählen</div>
                <div><span style={{color:'#fde047'}}>Space</span>: Varianten anzeigen</div>
                <div><span style={{color:'#fde047'}}>Backspace</span>: Zurück zu Typ</div>
              </>
            )}
            {panelMode === 'version' && (
              <>
                <div><span style={{color:'#fde047'}}>WASD</span>: Variante wählen</div>
                <div><span style={{color:'#fde047'}}>Space</span>: In Welt platzieren</div>
                <div><span style={{color:'#fde047'}}>Backspace</span>: Zurück zu Richtung</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
