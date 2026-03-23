import React, { useState, useEffect, useRef } from 'react';
import { Interpreter } from '../engine/interpreter';

export const BattleIDE = ({ level, onVictory, onFlee, autoPlay }) => {
  const [code, setCode] = useState("IN\nOUT\n");
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
    // Reset inputs when level changes
    setGameState(prev => ({
      ...prev,
      inputQueue: [...level.inputs],
      outputQueue: []
    }));
    setStatusMsg('');
    setCode("IN\nOUT\n");
    interpreterRef.current.reset();
  }, [level]);

  useEffect(() => {
    if (autoPlay && !statusMsg) {
      const timer1 = setTimeout(() => {
        handleAutoSolve();
      }, 500);
      const timer2 = setTimeout(() => {
        const btn = document.getElementById('run-btn');
        if (btn) btn.click();
      }, 1000);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
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

  const handleAutoSolve = () => {
    setCode(level.solution || "IN\nOUT");
  };

  const handleRun = () => {
    const interp = interpreterRef.current;
    interp.load(code, level.inputs);
    interp.runAll(level.maxCycles);
    updateStateFromInterpreter(interp);
    checkVictory(interp);
  };

  const handleStep = () => {
    const interp = interpreterRef.current;
    if (interp.cycleCount === 0 || interp.done || interp.error) {
      // First step or restarting
      if (interp.done || interp.error || interp.cycleCount === 0) {
        interp.load(code, level.inputs);
      }
    }
    interp.step();
    updateStateFromInterpreter(interp);
    
    if (interp.done) {
      checkVictory(interp);
    }
  };

  const checkVictory = (interp) => {
    if (interp.error) {
      setStatusMsg(`Fehler: ${interp.error}`);
      return;
    }

    // Check outputs
    const out = interp.outputQueue;
    const expected = level.expectedOutputs;
    let match = out.length === expected.length;
    if (match) {
      for (let i = 0; i < out.length; i++) {
        if (out[i] !== expected[i]) match = false;
      }
    }

    if (!match) {
      setStatusMsg(`Falsche Ausgabe. Erwartet: [${expected}], Bekommen: [${out}]`);
      return;
    }

    if (interp.cycleCount > level.maxCycles) {
      setStatusMsg(`Zu langsam! Zyklen: ${interp.cycleCount} / ${level.maxCycles}. Code optimieren!`);
      return;
    }

    setStatusMsg(`Sieg! Aufgabe gelöst mit ${interp.cycleCount} Zyklen.`);
    setTimeout(() => {
      onVictory();
    }, 2000);
  };

  return (
    <div className="retro-container p-6 w-full flex flex-col items-start gap-4" style={{ maxWidth: '900px', display: 'flex', flexDirection: 'row', textAlign: 'left' }}>
      {/* Left Panel: Description & Queues */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <h2 className="text-glow mb-2">{level.name}</h2>
          <p className="text-gray-300 whitespace-pre-line text-sm">{level.description}</p>
        </div>
        
        <div className="register-box">
          <div className="font-bold mb-1">Eingabe-Queue ({gameState.inputQueue.length})</div>
          <div className="flex gap-2 flex-wrap text-sm">
            {gameState.inputQueue.map((v, i) => <span key={i} className="bg-slate-700 p-1 rounded mono">{v}</span>)}
          </div>
        </div>
        
        <div className="register-box">
          <div className="font-bold mb-1">Ausgabe-Queue / Ziel</div>
          <p className="text-xs mb-1 text-gray-400">Erwartet: {level.expectedOutputs.join(' ')}</p>
          <div className="flex gap-2 flex-wrap text-sm border-t border-slate-600 pt-1 mt-1">
            {gameState.outputQueue.map((v, i) => <span key={i} className="bg-blue-900 p-1 rounded mono text-glow">{v}</span>)}
          </div>
        </div>
        
        <button onClick={onFlee} style={{ marginTop: 'auto', background: '#991b1b' }}>Fliehen (Zurück)</button>
      </div>

      {/* Middle Panel: Editor */}
      <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column' }}>
        <h3 className="mb-2">Code Editor</h3>
        <textarea 
          className="code-editor mono text-sm" 
          style={{ flex: 1, minHeight: '300px' }}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
        />
        <div className="flex gap-2 mt-2" style={{ display: 'flex', gap: '8px' }}>
          <button id="run-btn" onClick={handleRun} style={{ background: '#166534' }}>Run</button>
          <button onClick={handleStep} style={{ background: '#ca8a04' }}>Step</button>
          <button onClick={handleAutoSolve} style={{ background: '#6366f1', marginLeft: 'auto' }}>Auto-Solve (Dev)</button>
        </div>
        {statusMsg && (
          <div className={`mt-2 p-2 rounded text-sm font-bold ${statusMsg.startsWith('Sieg') ? 'text-glow-success' : 'text-glow-error'}`}>
            {statusMsg}
          </div>
        )}
      </div>

      {/* Right Panel: CPU State */}
      <div style={{ flex: 0.8, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h3>CPU State</h3>
        <div className="register-box mono">
          <div>ACC: <span className="text-glow">{gameState.registers.ACC}</span></div>
          <div>R1: {gameState.registers.R1}</div>
          <div>R2: {gameState.registers.R2}</div>
          <div>R3: {gameState.registers.R3}</div>
          <div>R4: {gameState.registers.R4}</div>
        </div>
        
        <div className="register-box mono text-sm">
          <div>EQUAL: {gameState.flags.EQUAL ? '1' : '0'}</div>
          <div>GREAT: {gameState.flags.GREATER ? '1' : '0'}</div>
          <div>LESS: {gameState.flags.LESS ? '1' : '0'}</div>
        </div>

        <div className="register-box mono text-sm">
          <div>PC: {gameState.pc + 1}</div>
          <div>Zyklen: {gameState.cycleCount}/{level.maxCycles}</div>
        </div>
      </div>
    </div>
  );
};
