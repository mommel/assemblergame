import React, { useState, useEffect, useRef } from 'react';
import { Interpreter } from '../engine/interpreter';
import { getBossSprite } from './WorldOverview';
import Spellbook from "./Spellbook";

const SPELLBOOK_ENTRIES = {
  IN: {
    title: 'IN',
    description: 'Liest die nächste Zahl aus der Eingabe-Queue in den ACC.',
    example: 'IN',
    level: 1,
  },
  OUT: {
    title: 'OUT',
    description: 'Schreibt den aktuellen ACC-Wert in die Ausgabe-Queue.',
    example: 'OUT',
    level: 1,
  },
  JMP: {
    title: 'JMP',
    description: 'Springt immer zu einer Zielzeile.',
    example: 'JMP 1',
    level: 1,
  },
  ADD: {
    title: 'ADD',
    description: 'Addiert einen Wert zum ACC.',
    example: 'ADD 5',
    level: 2,
  },
  SUB: {
    title: 'SUB',
    description: 'Subtrahiert einen Wert vom ACC.',
    example: 'SUB R1',
    level: 3,
  },
  MOV: {
    title: 'MOV',
    description: 'Kopiert Werte zwischen ACC, Registern und Konstanten.',
    example: 'MOV R1, ACC',
    level: 4,
  },
  CMP: {
    title: 'CMP',
    description: 'Vergleicht ACC mit einem Wert und setzt EQ/GT/LT Flags.',
    example: 'CMP 0',
    level: 5,
  },
  JEQ: {
    title: 'JEQ',
    description: 'Springt zur Zielzeile, wenn EQ gesetzt ist.',
    example: 'JEQ 7',
    level: 6,
  },
  JGT: {
    title: 'JGT',
    description: 'Springt zur Zielzeile, wenn ACC größer war.',
    example: 'JGT 5',
    level: 7,
  },
  JLT: {
    title: 'JLT',
    description: 'Springt zur Zielzeile, wenn ACC kleiner war.',
    example: 'JLT 9',
    level: 8,
  },
};

const getDisallowedCommands = (sourceCode, unlockedInstructions) => {
  const allowed = new Set(unlockedInstructions.map((instruction) => instruction.toUpperCase()));
  const used = sourceCode
    .split('\n')
    .map((line) => line.split('//')[0].trim().toUpperCase())
    .filter(Boolean)
    .map((line) => line.split(/[\s,]+/)[0]);

  return [...new Set(used.filter((command) => !allowed.has(command)))];
};

export const BattleIDE = ({ level, onVictory, onFlee, autoPlay, levelIndex, unlockedInstructions = [] }) => {
  const [code, setCode] = useState("IN\nOUT\n");
  const [isSpellbookOpen, setIsSpellbookOpen] = useState(false);
  const [gameState, setGameState] = useState({
    registers: { R1: 0, R2: 0, R3: 0, R4: 0, ACC: 0 },
    flags: { EQUAL: false, GREATER: false, LESS: false },
    inputQueue: [],
    outputQueue: [],
    pc: 0,
    cycleCount: 0,
    error: null,
    done: false
  });
  const [statusMsg, setStatusMsg] = useState('');
  const interpreterRef = useRef(new Interpreter());

  useEffect(() => {
    setGameState(prev => ({ ...prev, inputQueue: [...level.inputs], outputQueue: [] }));
    setStatusMsg('');
    setCode("IN\nOUT\n");
    setIsSpellbookOpen(false);
    interpreterRef.current.reset();
  }, [level]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setIsSpellbookOpen(false);
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  useEffect(() => {
    if (autoPlay && !statusMsg) {
      const t1 = setTimeout(() => handleAutoSolve(), 500);
      const t2 = setTimeout(() => {
        const btn = document.getElementById('run-btn');
        if (btn) btn.click();
      }, 1000);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [autoPlay, statusMsg, level]);

  const updateStateFromInterpreter = (interp) => {
    setGameState({
      registers: { ...interp.registers },
      flags: { ...interp.flags },
      inputQueue: [...interp.inputQueue],
      outputQueue: [...interp.outputQueue],
      pc: interp.pc,
      cycleCount: interp.cycleCount,
      error: interp.error,
      done: interp.done
    });
  };

  const handleAutoSolve = () => setCode(level.solution || "IN\nOUT");

  const handleRun = () => {
    const disallowed = getDisallowedCommands(code, unlockedInstructions);
    if (disallowed.length > 0) {
      setStatusMsg(`Spell noch gesperrt: ${disallowed.join(', ')}. Verfügbar: ${unlockedInstructions.join(', ')}`);
      return;
    }
    const interp = interpreterRef.current;
    interp.load(code, level.inputs);
    interp.runAll(level.maxCycles);
    updateStateFromInterpreter(interp);
    checkVictory(interp);
  };

  const handleStep = () => {
    const disallowed = getDisallowedCommands(code, unlockedInstructions);
    if (disallowed.length > 0) {
      setStatusMsg(`Spell noch gesperrt: ${disallowed.join(', ')}. Verfügbar: ${unlockedInstructions.join(', ')}`);
      return;
    }
    const interp = interpreterRef.current;
    if (interp.cycleCount === 0 || interp.done || interp.error) {
      interp.load(code, level.inputs);
    }
    interp.step();
    updateStateFromInterpreter(interp);
    if (interp.done) checkVictory(interp);
  };

  const checkVictory = (interp) => {
    if (interp.error) { setStatusMsg(`Fehler: ${interp.error}`); return; }
    const out = interp.outputQueue, expected = level.expectedOutputs;
    let match = out.length === expected.length;
    if (match) for (let i = 0; i < out.length; i++) if (out[i] !== expected[i]) match = false;
    if (!match) { setStatusMsg(`Falsche Ausgabe. Erwartet: [${expected}], Bekommen: [${out}]`); return; }
    if (interp.cycleCount > level.maxCycles) { setStatusMsg(`Zu langsam! ${interp.cycleCount} / ${level.maxCycles} Zyklen.`); return; }
    setStatusMsg(`Sieg! Gelöst in ${interp.cycleCount} Zyklen. ✅`);
    setTimeout(() => onVictory(), 2000);
  };

  const bossIdx = levelIndex ?? 0;
  const bossImg = getBossSprite(bossIdx);
  const spellbookEntries = unlockedInstructions.map((instruction) => {
    const knownSpell = SPELLBOOK_ENTRIES[instruction];
    if (knownSpell) return knownSpell;
    return {
      title: instruction,
      description: 'Noch keine Beschreibung hinterlegt.',
      example: instruction,
    };
  });

  return (
    <div 
      class="roboto-condensed-light"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
        width: '100%',
        maxWidth: '1000px',
      }}>
      {/* Main content row — FIXED height so panels never shift */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '12px',
        width: '100%',
        height: '460px',
        alignItems: 'stretch',
      }}>

        {/* === LEFT PANEL: Level info + queues + flee === */}
        <div
          class="descriptiontext" 

          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            background: '#0f172a',
            border: '2px solid #334155',
            borderRadius: '8px',
            padding: '14px',
            overflow: 'hidden',
            minWidth: 0,
          }}>        
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div>
              <h2 className="text-glow titletext" style={{ margin: 0, fontSize: '1.1rem' }}>{level.name}</h2>
            </div>
          </div>

          <p class="descriptiontext" style={{ color: '#cbd5e1', whiteSpace: 'pre-line', fontSize: '18px', lineHeight: 1.6, margin: 0 }}>
            {level.description}
          </p>
          
          <button
            class="fontbig buttonstext"
            type="button"
            onClick={() => setIsSpellbookOpen(true)}
            style={{
              background: '#7c2d12',
              border: '1px solid #c2410c',
              color: '#ffedd5',
              padding: '8px 14px',
              width: '100%',
              cursor: 'pointer',
            }}
          >
            Spellbook
          </button>
          
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '10px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '6px', color: '#94a3b8' }}>
              Eingabe-Queue ({gameState.inputQueue.length})
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {gameState.inputQueue.map((v, i) => (
                <span key={i} style={{ background: '#334155', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '13px' }}>{v}</span>
              ))}
            </div>
          </div>

          {/* Output — fixed min-height so adding items doesn't shift layout */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '10px', flexShrink: 0 }}>
            <div style={{ fontWeight: 'bold',  fontSize: '1.1rem', marginBottom: '4px', color: '#94a3b8' }}>Ausgabe / Ziel</div>
            <div style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '6px' }}>Erwartet: {level.expectedOutputs.join(' ')}</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', minHeight: '26px', alignContent: 'flex-start' }}>
              {gameState.outputQueue.map((v, i) => (
                <span key={i} className="text-glow" style={{ background: '#1e3a5f', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '13px' }}>{v}</span>
              ))}
            </div>
          </div>
        </div>

        {/* === MIDDLE PANEL: Code Editor — fills height, textarea is flex:1 === */}
        <div style={{
          flex: 1.5,
          display: 'flex',
          flexDirection: 'column',
          background: '#0f172a',
          border: '2px solid #334155',
          borderRadius: '8px',
          padding: '14px',
          minWidth: 0,
          overflow: 'hidden',
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Code Editor</h3>
          <textarea
            className="code-editor consoletext"
            style={{
              flex: 1,
              fontSize: '14px',
              color: '#4ade80',
              background: '#0a0f1a',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '12px',
              resize: 'none',
              lineHeight: 1.6,
              overflow: 'auto',
            }}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
          />
          <div
            class="descriptiontext" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div>
              <h2 className="text-glow-loot" style={{ margin: 0 }}>{level.grantsReward}</h2>
            </div>
          </div>
          <div
            class="descriptiontext"
            style={{
              marginTop: '10px',
              minHeight: '44px',
              padding: '8px 12px',
              borderRadius: '6px',
              boxSizing: 'border-box',
              visibility: statusMsg ? 'visible' : 'hidden',
              background: statusMsg.startsWith('Sieg') ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              border: `1px solid ${statusMsg.startsWith('Sieg') ? '#10b981' : '#ef4444'}`,
              color: statusMsg.startsWith('Sieg') ? '#34d399' : '#f87171',
            }}>
              {statusMsg}
            </div>
        </div>

        {/* === RIGHT PANEL: CPU State — flexShrink:0 === */}
        <div style={{
          flex: 0.75,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          gap: '10px',
          background: '#0f172a',
          border: '2px solid #334155',
          borderRadius: '8px',
          padding: '14px',
          overflow: 'hidden',
        }}>
          <img
              src={bossImg}
              alt="boss"
              style={{
                width: '72px', height: '72px',
                objectFit: 'contain',
                imageRendering: 'pixelated',
                filter: 'drop-shadow(0 0 8px rgba(239,68,68,0.7))',
                animation: 'bounce-boss-fight 2.1s infinite',
                flexShrink: 0,
              }}
            />
          <h3 style={{ margin: 0, fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CPU State</h3>
          <div style={{ background: '#1e293b', borderRadius: '6px', padding: '10px', fontFamily: 'monospace', fontSize: '13px' }}>
            <div>ACC: <span className="text-glow">{gameState.registers.ACC}</span></div>
            <div>R1: {gameState.registers.R1}</div>
            <div>R2: {gameState.registers.R2}</div>
            <div>R3: {gameState.registers.R3}</div>
            <div>R4: {gameState.registers.R4}</div>
          </div>
          <div style={{ background: '#1e293b', borderRadius: '6px', padding: '10px', fontFamily: 'monospace', fontSize: '12px' }}>
            <div>EQ: {gameState.flags.EQUAL ? '1' : '0'}</div>
            <div>GT: {gameState.flags.GREATER ? '1' : '0'}</div>
            <div>LT: {gameState.flags.LESS ? '1' : '0'}</div>
          </div>
          <div style={{ background: '#1e293b', borderRadius: '6px', padding: '10px', fontFamily: 'monospace', fontSize: '12px' }}>
            <div>PC: {gameState.pc + 1}</div>
            <div>Zyklen: {gameState.cycleCount}/{level.maxCycles}</div>
          </div>
        </div>
      </div>

      {/* === BUTTONS PANEL (separate row below) === */}
      <div
        class="fontbig buttonstext" 
        style={{
          display: 'flex',
          gap: '10px',
          marginTop: '12px',
          padding: '14px 20px',
          background: '#0f172a',
          border: '2px solid #334155',
          borderRadius: '8px',
          width: '100%',
          boxSizing: 'border-box',
          alignItems: 'center',
        }}>
        <button onClick={onFlee} style={{ marginTop: 'auto', background: '#991b1b', padding: '8px 16px' }}>
          Fliehen (Zurück)
        </button>

        <button id="run-btn" onClick={handleRun} style={{ background: '#166534', padding: '8px 20px' }}>▶ Run</button>
        <button onClick={handleStep} style={{ background: '#854d0e', padding: '8px 20px' }}>⏭ Step</button>
        
        <button onClick={handleAutoSolve} style={{ background: '#4338ca', padding: '8px 20px', marginLeft: 'auto' }}>🤖 Auto-Solve</button>
      </div>

      {isSpellbookOpen && (
        <div class="spellbook-overlay">
          <Spellbook spells={spellbookEntries} />
        </div>
      )}
    </div>
  );
};
