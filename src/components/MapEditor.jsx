import React, { useState, useEffect, useCallback, useRef } from 'react';
import { VIEW_COLS, VIEW_ROWS, TILE_SIZE, MAP_WIDTH, MAP_HEIGHT, getTileAt, getTileImage, getTileId, TILE_MAP } from './Overworld';

const BASE_CATEGORIES = [
  { label: 'Grass', generic: 'grass', prefix: 'grass' },
  { label: 'See', generic: 'see', prefix: 'see' },
  { label: 'Bäume / Wald', generic: 'forest', prefix: 'wald' },
  { label: 'Berge', generic: 'mountain', prefix: 'berg' },
  { label: 'Meer', generic: 'meer', prefix: 'meer' },
  { label: 'Fluss', generic: 'fluss', prefix: 'fluss' },
  { label: 'Weg', generic: 'weg', prefix: 'weg' }
];

const getStructuredCategories = () => {
  const cats = [];
  const processedPrefixes = new Set();
  
  BASE_CATEGORIES.forEach(cat => {
    const variants = [{ id: cat.generic, label: `${cat.label} (Auto)` }];
    Object.keys(TILE_MAP).filter(k => k.split('_')[0] === cat.prefix).sort().forEach(v => {
      // Avoid duplicating if the base tile name is exactly the generic name
      if (v !== cat.generic) variants.push({ id: v, label: v });
    });
    cats.push({ ...cat, variants });
    processedPrefixes.add(cat.prefix);
  });

  Object.keys(TILE_MAP).forEach(key => {
    const prefix = key.split('_')[0];
    if (!processedPrefixes.has(prefix)) {
      const variants = [];
      Object.keys(TILE_MAP).filter(k => k.split('_')[0] === prefix).sort().forEach(v => {
        variants.push({ id: v, label: v });
      });
      const generic = TILE_MAP[prefix] ? prefix : variants[0].id;
      cats.push({ 
        label: prefix.charAt(0).toUpperCase() + prefix.slice(1), 
        generic, 
        prefix, 
        variants 
      });
      processedPrefixes.add(prefix);
    }
  });
  
  return cats;
};

const CATEGORIES = getStructuredCategories();

export const MapEditor = ({ initialGrid, isGenerated }) => {
  const [grid, setGrid] = useState(initialGrid);
  
  useEffect(() => {
    // One-time baking pass to convert generic tiles into exact specific variants
    // so world.json strictly contains WYSIWYG variants (e.g. 'weg_nw' instead of 'weg').
    const generics = new Set(['grass', 'meer', 'fluss', 'forest', 'mountain', 'weg', 'see']);
    const hasGenerics = initialGrid.some(row => row.some(cell => generics.has(cell)));
    
    if (hasGenerics) {
      const bakedGrid = initialGrid.map((row, y) => row.map((cell, x) => getTileId(initialGrid, x, y, cell)));
      setGrid(bakedGrid);
      fetch('/api/save-map', {
        method: 'POST',
        body: JSON.stringify({ grid: bakedGrid })
      }).catch(e => console.error("Baking save failed", e));
    } else if (isGenerated) {
      fetch('/api/save-map', {
        method: 'POST',
        body: JSON.stringify({ grid: initialGrid })
      }).catch(e => console.error("Initial save failed", e));
    }
  }, [isGenerated, initialGrid]);

  const [cursorPos, setCursorPos] = useState({ x: 5, y: 5 });
  const [panelMode, setPanelMode] = useState('closed'); // 'closed', 'category', 'variant'
  const [selectedCatIdx, setSelectedCatIdx] = useState(0);
  const [selectedVarIdx, setSelectedVarIdx] = useState(0);
  
  const [saving, setSaving] = useState(false);
  const panelRef = useRef(null);
  const activeTileRefs = useRef({});

  useEffect(() => {
    setGrid(initialGrid);
  }, [initialGrid]);

  const saveMap = async (newGrid) => {
    setSaving(true);
    try {
      await fetch('/api/save-map', {
        method: 'POST',
        body: JSON.stringify({ grid: newGrid })
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
        setPanelMode('category');
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
    } else if (panelMode === 'category') {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setPanelMode('variant');
        setSelectedVarIdx(0);
        return;
      }
      if (e.key === 'Backspace') {
        e.preventDefault();
        setPanelMode('closed');
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'w') {
        setSelectedCatIdx(prev => (prev > 0 ? prev - 1 : CATEGORIES.length - 1));
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        setSelectedCatIdx(prev => (prev < CATEGORIES.length - 1 ? prev + 1 : 0));
      }
    } else if (panelMode === 'variant') {
      const variantsCount = CATEGORIES[selectedCatIdx].variants.length;
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        const tileId = CATEGORIES[selectedCatIdx].variants[selectedVarIdx].id;
        const newGrid = grid.map(row => [...row]);
        newGrid[cursorPos.y][cursorPos.x] = tileId;
        setGrid(newGrid);
        saveMap(newGrid);
        setPanelMode('closed');
        return;
      }
      if (e.key === 'Backspace') {
        e.preventDefault();
        setPanelMode('category');
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'w') {
        setSelectedVarIdx(prev => (prev > 0 ? prev - 1 : variantsCount - 1));
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        setSelectedVarIdx(prev => (prev < variantsCount - 1 ? prev + 1 : 0));
      }
    }
  }, [panelMode, selectedCatIdx, selectedVarIdx, grid, cursorPos]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (panelMode !== 'closed') {
      const activeIdx = panelMode === 'category' ? selectedCatIdx : selectedVarIdx;
      const el = activeTileRefs.current[activeIdx];
      if (el && panelRef.current) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedCatIdx, selectedVarIdx, panelMode]);

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

        cells.push(
          <div key={`${wx}-${wy}`} style={{
            position: 'relative', width: `${TILE_SIZE}px`, height: `${TILE_SIZE}px`,
            padding: 0, margin: 0, lineHeight: 0, flexShrink: 0,
          }}>
            <img src={tileImg} alt="" style={{
              width: `${TILE_SIZE}px`, height: `${TILE_SIZE}px`,
              objectFit: 'cover', display: 'block', imageRendering: 'pixelated',
            }} />
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
    if (panelMode === 'category') {
      return CATEGORIES.map((cat, idx) => {
        const isActive = selectedCatIdx === idx;
        return (
          <div 
            key={`cat-${idx}`} 
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
            <img 
              src={getTileImage(grid, 0, 0, cat.generic)} 
              alt={cat.label} 
              style={{ width: '28px', height: '28px', objectFit: 'cover', imageRendering: 'pixelated', borderRadius: '4px' }} 
            />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {cat.label} ({cat.variants.length})
            </span>
          </div>
        );
      });
    }

    if (panelMode === 'variant') {
      const activeCat = CATEGORIES[selectedCatIdx];
      return [
        <div key="header-var" style={{
          padding: '8px 12px 4px', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold'
        }}>
          {activeCat.label} Varianten
        </div>,
        ...activeCat.variants.map((v, idx) => {
          const isActive = selectedVarIdx === idx;
          return (
            <div 
              key={`var-${idx}`} 
              ref={el => activeTileRefs.current[idx] = el}
              style={{
                padding: '6px 12px',
                backgroundColor: isActive ? '#334155' : 'transparent',
                borderLeft: isActive ? '3px solid #fde047' : '3px solid transparent',
                color: isActive ? '#fde047' : '#cbd5e1',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
              <img 
                src={getTileImage(grid, 0, 0, v.id)} 
                alt={v.label} 
                style={{ width: '28px', height: '28px', objectFit: 'cover', imageRendering: 'pixelated', borderRadius: '4px' }} 
              />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {v.label}
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
            {panelMode === 'category' && (
              <>
                <div><span style={{color:'#fde047'}}>WASD</span>: Typ wählen</div>
                <div><span style={{color:'#fde047'}}>Space</span>: Varianten anzeigen</div>
                <div><span style={{color:'#fde047'}}>Backspace</span>: Schließen</div>
              </>
            )}
            {panelMode === 'variant' && (
              <>
                <div><span style={{color:'#fde047'}}>WASD</span>: Variante wählen</div>
                <div><span style={{color:'#fde047'}}>Space</span>: In Welt platzieren</div>
                <div><span style={{color:'#fde047'}}>Backspace</span>: Zurück zu Typen</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
