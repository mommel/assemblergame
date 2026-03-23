import React, { useState, useMemo } from 'react';
import { Overworld } from './components/Overworld';
import { WorldOverview } from './components/WorldOverview';
import { BattleIDE } from './components/BattleIDE';
import { levels } from './engine/levels';
import { generateWorld } from './engine/worldgen';
import imgTitle from './assets/title.png';
import './index.css';

function App() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [inBattle, setInBattle] = useState(false);
  const [activeEncounter, setActiveEncounter] = useState(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [showWorldMap, setShowWorldMap] = useState(false);

  // Player position — lives in App so it survives battle transitions
  const [playerPos, setPlayerPos] = useState({ x: 5, y: 5 });
  // Position BEFORE entering battle — flee puts player here
  const [foughtLevelIndex, setFoughtLevelIndex] = useState(0);
  const [preBattlePos, setPreBattlePos] = useState({ x: 5, y: 5 });

  const { grid: mapGrid } = useMemo(() => generateWorld(), []);

  const handleEncounter = (level, posBeforeBattle, bossIdx) => {
    setPreBattlePos(posBeforeBattle);
    setFoughtLevelIndex(bossIdx);
    setActiveEncounter(level);
    setInBattle(true);
  };

  const handleVictory = () => {
    setInBattle(false);
    // Advance progress: if the fought boss was the current target, move forward
    // If a later boss was fought (skipping), advance to max progress seen + 1
    setCurrentLevelIndex(prev => Math.min(Math.max(prev, foughtLevelIndex + 1), levels.length - 1));
  };

  const handleFlee = () => {
    setPlayerPos(preBattlePos); // restore pre-battle position
    setInBattle(false);
  };

  if (showWorldMap) {
    return (
      <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '1rem' }}>
        <img src={imgTitle} alt="Virenland Assembly RPG" style={{ height: '60px', objectFit: 'contain', marginBottom: '0.5rem' }} />
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
      <img src={imgTitle} alt="Virenland Assembly RPG" style={{ height: '70px', objectFit: 'contain', marginBottom: '0.75rem' }} />

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem' }}>
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
          levelIndex={foughtLevelIndex}
        />
      )}
    </div>
  );
}

export default App;
