import React, { useState, useMemo } from 'react';
import { Overworld } from './components/Overworld';
import { WorldOverview } from './components/WorldOverview';
import { BattleIDE } from './components/BattleIDE';
import { levels } from './engine/levels';
import { generateWorld } from './engine/worldgen';
import './index.css';

function App() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [inBattle, setInBattle] = useState(false);
  const [activeEncounter, setActiveEncounter] = useState(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [showWorldMap, setShowWorldMap] = useState(false);

  const [playerPos, setPlayerPos] = useState({ x: 5, y: 5 });

  const { grid: mapGrid, enemyPositions } = useMemo(() => generateWorld(), []);

  const handleEncounter = (level, pos) => {
    setActiveEncounter(level);
    setInBattle(true);
  };

  const handleVictory = () => {
    setInBattle(false);
    setCurrentLevelIndex(prev => Math.min(prev + 1, levels.length - 1));
  };

  const handleFlee = () => {
    setInBattle(false);
  };

  if (showWorldMap) {
    return (
      <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '1rem' }}>
        <h1 className="text-glow mb-2" style={{ fontSize: '2rem' }}>Virenland Assembly RPG</h1>
        <WorldOverview
          mapGrid={mapGrid}
          playerPos={playerPos}
          levels={levels}
          currentLevelIndex={currentLevelIndex}
          onClose={() => setShowWorldMap(false)}
        />
      </div>
    );
  }

  return (
    <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 className="text-glow mb-2" style={{ fontSize: '2.5rem' }}>Virenland Assembly RPG</h1>

      <div className="mb-4" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button
          onClick={() => setAutoPlay(!autoPlay)}
          style={{ background: autoPlay ? '#dc2626' : '#059669', fontWeight: 'bold' }}
        >
          {autoPlay ? 'Bot-Modus stoppen' : '🤖 Full Playthrough starten'}
        </button>
        {autoPlay && <span className="text-glow animate-pulse">Autonomer Agent steuert das Spiel...</span>}
      </div>

      {!inBattle ? (
        <Overworld
          levels={levels}
          currentLevelIndex={currentLevelIndex}
          onEncounter={handleEncounter}
          autoPlay={autoPlay}
          onShowWorldMap={() => setShowWorldMap(true)}
          playerPos={playerPos}
          onPlayerMove={setPlayerPos}
        />
      ) : (
        <BattleIDE
          level={activeEncounter}
          onVictory={handleVictory}
          onFlee={handleFlee}
          autoPlay={autoPlay}
        />
      )}
    </div>
  );
}

export default App;
