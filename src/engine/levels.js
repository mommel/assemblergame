import { getBossSpellPlan } from './spellProgression';

const baseLevels = [
  {
    id: 1,
    name: "Level 1: Das Erste Programm",
    description: "Willkommen beim Assembler RPG! Befehle:\nIN - Liest eine Zahl in den ACC (Accumulator).\nOUT - Schreibt den ACC in die Ausgabe.\n\nAufgabe: Lies alle Zahlen ein und gib sie unverändert wieder aus.",
    inputs: [5, 12, -3],
    expectedOutputs: [5, 12, -3],
    maxCycles: 20,
    maxInstructions: 10,
    mapProps: { type: 'enemy', x: 10, y: 15 },
    solution: "IN\nOUT\nJMP 1"
  },
  {
    id: 2,
    name: "Level 2: Arithmetik Plus",
    description: "Befehle:\nADD x - Addiert x zum ACC.\n\nAufgabe: Lies Zahlen ein, addiere jeweils 5 dazu und gib sie aus.",
    inputs: [10, 0, -5],
    expectedOutputs: [15, 5, 0],
    maxCycles: 30,
    maxInstructions: 10,
    mapProps: { type: 'enemy', x: 20, y: 15 },
    solution: "IN\nADD 5\nOUT\nJMP 1"
  },
  {
    id: 3,
    name: "Level 3: Subtraktion",
    description: "Befehle:\nSUB x - Subtrahiert x vom ACC.\n\nAufgabe: Lies jede Zahl, ziehe 3 davon ab und gib das Ergebnis aus.",
    inputs: [10, 3, 0],
    expectedOutputs: [7, 0, -3],
    maxCycles: 30,
    maxInstructions: 10,
    mapProps: { type: 'enemy', x: 30, y: 12 },
    solution: "IN\nSUB 3\nOUT\nJMP 1"
  },
  {
    id: 4,
    name: "Level 4: Multiplikation mit 2",
    description: "Es gibt keinen MUL-Befehl! Aber du kannst den ACC mit sich selbst addieren.\nNutze Register: MOV R1, ACC.\nDann ADD R1.\n\nAufgabe: Verdopple jede Eingabe.",
    inputs: [5, 10, -2],
    expectedOutputs: [10, 20, -4],
    maxCycles: 40,
    maxInstructions: 15,
    mapProps: { type: 'enemy', x: 40, y: 10 },
    solution: "IN\nMOV R1, ACC\nADD R1\nOUT\nJMP 1"
  },
  {
    id: 5,
    name: "Level 5: Multiplikation mit 3",
    description: "Aufgabe: Verdreifache jede Eingabe.",
    inputs: [2, 4, -1],
    expectedOutputs: [6, 12, -3],
    maxCycles: 40,
    maxInstructions: 15,
    mapProps: { type: 'enemy', x: 50, y: 10 },
    solution: "IN\nMOV R1, ACC\nADD R1\nADD R1\nOUT\nJMP 1"
  },
  {
    id: 6,
    name: "Level 6: Bedingte Ausgabe (Zero)",
    description: "Bedingungen:\nCMP x - Vergleicht ACC mit x.\nJEQ line - Springt zur Zeile, wenn ACC == x.\n\nAufgabe: Wenn die Eingabe 0 ist, gib 1 aus. Ansonsten gib 0 aus.",
    inputs: [0, 5, 0, -2, 0],
    expectedOutputs: [1, 0, 1, 0, 1],
    maxCycles: 100,
    maxInstructions: 15,
    mapProps: { type: 'enemy', x: 50, y: 20 },
    solution: "IN\nCMP 0\nJEQ 7\nMOV ACC, 0\nOUT\nJMP 1\nMOV ACC, 1\nOUT\nJMP 1"
  },
  {
    id: 7,
    name: "Level 7: Positivitäts-Filter",
    description: "Befehle:\nJGT line (Jump if Greater Than)\n\nAufgabe: Gib nur die positiven ( > 0 ) Zahlen aus. Wirf alle anderen weg.",
    inputs: [5, -2, 0, 10, -5],
    expectedOutputs: [5, 10],
    maxCycles: 50,
    maxInstructions: 10,
    mapProps: { type: 'enemy', x: 45, y: 30 },
    solution: "IN\nCMP 0\nJGT 5\nJMP 1\nOUT\nJMP 1"
  },
  {
    id: 8,
    name: "Level 8: Negative Filter",
    description: "Befehle:\nJLT line (Jump if Less Than)\n\nAufgabe: Gib nur die rein negativen ( < 0 ) Zahlen aus.",
    inputs: [3, -4, 0, -1, 5],
    expectedOutputs: [-4, -1],
    maxCycles: 50,
    maxInstructions: 10,
    mapProps: { type: 'enemy', x: 40, y: 40 },
    solution: "IN\nCMP 0\nJLT 5\nJMP 1\nOUT\nJMP 1"
  },
  {
    id: 9,
    name: "Level 9: Maximum von Zweien",
    description: "Aufgabe: Lies ZWEI Zahlen. Gib die größere von beiden aus. Wiederhole dies.\n(Hinweis: Lies A in R1, lies B in ACC. Vergleiche ACC mit R1.)",
    inputs: [5, 10, 20, 10, -5, -2],
    expectedOutputs: [10, 20, -2],
    maxCycles: 150,
    maxInstructions: 20,
    mapProps: { type: 'enemy', x: 30, y: 50 },
    solution: "IN\nMOV R1, ACC\nIN\nCMP R1\nJGT 9\nMOV ACC, R1\nOUT\nJMP 1\nOUT\nJMP 1"
  },
  {
    id: 10,
    name: "Level 10: Minimum von Zweien",
    description: "Aufgabe: Lies zwei Zahlen und gib immer die kleinere aus.",
    inputs: [5, 10, -10, 20, 0, 0],
    expectedOutputs: [5, -10, 0],
    maxCycles: 150,
    maxInstructions: 20,
    mapProps: { type: 'enemy', x: 20, y: 50 },
    solution: "IN\nMOV R1, ACC\nIN\nCMP R1\nJLT 9\nMOV ACC, R1\nOUT\nJMP 1\nOUT\nJMP 1"
  },
  {
    id: 11,
    name: "Level 11: Absolutwert",
    description: "Die Betragsfunktion |x|. Wenn die Zahl negativ ist, mache sie positiv (0 - x).",
    inputs: [5, -5, 10, -12, 0],
    expectedOutputs: [5, 5, 10, 12, 0],
    maxCycles: 100,
    maxInstructions: 15,
    mapProps: { type: 'enemy', x: 10, y: 40 },
    solution: "IN\nCMP 0\nJLT 6\nOUT\nJMP 1\nMOV R1, ACC\nMOV ACC, 0\nSUB R1\nOUT\nJMP 1"
  },
  {
    id: 12,
    name: "Level 12: Signum",
    description: "Wenn x > 0: Gib 1 aus.\nWenn x < 0: Gib -1 aus.\nWenn x == 0: Gib 0 aus.",
    inputs: [42, -5, 0, 2, -1],
    expectedOutputs: [1, -1, 0, 1, -1],
    maxCycles: 150,
    maxInstructions: 20,
    mapProps: { type: 'enemy', x: 10, y: 30 },
    solution: "IN\nCMP 0\nJEQ 11\nJGT 8\nMOV ACC, -1\nOUT\nJMP 1\nMOV ACC, 1\nOUT\nJMP 1\nMOV ACC, 0\nOUT\nJMP 1"
  },
  {
    id: 13,
    name: "Level 13: Jede Zweite",
    description: "Aufgabe: Wirf die erste Zahl weg. Gib die zweite aus. Wirf die dritte weg, gib die vierte aus...",
    inputs: [1, 2, 3, 4, 5, 6],
    expectedOutputs: [2, 4, 6],
    maxCycles: 60,
    maxInstructions: 10,
    mapProps: { type: 'enemy', x: 15, y: 20 },
    solution: "IN\nIN\nOUT\nJMP 1"
  },
  {
    id: 14,
    name: "Level 14: Summe aus Zwei",
    description: "Aufgabe: Lies zwei Zahlen aus der Queue, addiere sie und gib das Ergebnis aus.",
    inputs: [5, 5, -2, 4, 10, 20],
    expectedOutputs: [10, 2, 30],
    maxCycles: 60,
    maxInstructions: 10,
    mapProps: { type: 'enemy', x: 25, y: 25 },
    solution: "IN\nMOV R1, ACC\nIN\nADD R1\nOUT\nJMP 1"
  },
  {
    id: 15,
    name: "Level 15: Differenz",
    description: "Aufgabe: Lies A, lies B. Gib A - B aus.",
    inputs: [10, 3, 5, 10, -2, -5],
    expectedOutputs: [7, -5, 3],
    maxCycles: 60,
    maxInstructions: 10,
    mapProps: { type: 'enemy', x: 35, y: 25 },
    solution: "IN\nMOV R1, ACC\nIN\nMOV R2, ACC\nMOV ACC, R1\nSUB R2\nOUT\nJMP 1"
  },
  {
    id: 16,
    name: "Level 16: Paare Tauschen",
    description: "Die Kiste hat verkehrte Papiere! Lies zwei Zahlen A und B, und gib sie als B und A aus.",
    inputs: [1, 2, 3, 4, 5, 6],
    expectedOutputs: [2, 1, 4, 3, 6, 5],
    maxCycles: 80,
    maxInstructions: 15,
    mapProps: { type: 'enemy', x: 45, y: 25 },
    solution: "IN\nMOV R1, ACC\nIN\nOUT\nMOV ACC, R1\nOUT\nJMP 1"
  },
  {
    id: 17,
    name: "Level 17: Triple Tausch",
    description: "Lies A, B, C und gib C, B, A (in umgekehrter Reihenfolge) aus.",
    inputs: [1, 2, 3, 4, 5, 6],
    expectedOutputs: [3, 2, 1, 6, 5, 4],
    maxCycles: 100,
    maxInstructions: 20,
    mapProps: { type: 'enemy', x: 55, y: 35 },
    solution: "IN\nMOV R1, ACC\nIN\nMOV R2, ACC\nIN\nOUT\nMOV ACC, R2\nOUT\nMOV ACC, R1\nOUT\nJMP 1"
  },
  {
    id: 18,
    name: "Level 18: Sequenz Zählen",
    description: "Die Queue enthält Sequenzen positiver Zahlen, getrennt von Nullen.\nAufgabe: Für jede Sequenz zähle, wie viele positive Zahlen es waren, bis die 0 kam. Gib die Anzahl(Count) bei einer 0 aus.",
    inputs: [5, 12, 0, 8, 0, 9, 10, 11, 0, 0],
    expectedOutputs: [2, 1, 3, 0],
    maxCycles: 300,
    maxInstructions: 15,
    mapProps: { type: 'enemy', x: 60, y: 45 },
    solution: "MOV R1, 0\nIN\nCMP 0\nJEQ 9\nMOV ACC, R1\nADD 1\nMOV R1, ACC\nJMP 2\nMOV ACC, R1\nOUT\nMOV R1, 0\nJMP 2"
  },
  {
    id: 19,
    name: "Level 19: Sequenz Summe",
    description: "Gleiches Spiel, aber gib die SUMME aller Zahlen bis zur 0 aus.",
    inputs: [5, 10, 0, 2, 0, 1, 2, 3, 0, 0],
    expectedOutputs: [15, 2, 6, 0],
    maxCycles: 300,
    maxInstructions: 15,
    mapProps: { type: 'enemy', x: 70, y: 50 },
    solution: "MOV R1, 0\nIN\nCMP 0\nJEQ 8\nADD R1\nMOV R1, ACC\nJMP 2\nMOV ACC, R1\nOUT\nMOV R1, 0\nJMP 2"
  },
  {
    id: 20,
    name: "Level 20: Bedingter Tausch (Sortieren)",
    description: "Lies 2 Zahlen A und B. Gib zuerst die kleinere, DANN die größere Zahl aus (Aufsteigend sortieren).",
    inputs: [10, 5, 2, 8, 4, 4],
    expectedOutputs: [5, 10, 2, 8, 4, 4],
    maxCycles: 200,
    maxInstructions: 20,
    mapProps: { type: 'enemy', x: 80, y: 55 },
    solution: "IN\nMOV R1, ACC\nIN\nMOV R2, ACC\nCMP R1\nJLT 12\nMOV ACC, R1\nOUT\nMOV ACC, R2\nOUT\nJMP 1\nMOV ACC, R2\nOUT\nMOV ACC, R1\nOUT\nJMP 1"
  },
  {
    id: 21,
    name: "Level 21: Countdown",
    description: "Lies N ein. Gib N, N-1, N-2 ... bis 1 aus.",
    inputs: [3, 2],
    expectedOutputs: [3, 2, 1, 2, 1],
    maxCycles: 400,
    maxInstructions: 20,
    mapProps: { type: 'enemy', x: 90, y: 45 },
    solution: "IN\nCMP 0\nJEQ 1\nOUT\nSUB 1\nJMP 2"
  },
  {
    id: 22,
    name: "Level 22: Fünfer Reihe Check",
    description: "Gib 1 aus, wenn die Zahl genau 5 ist. Andernfalls 0.",
    inputs: [2, 5, 10, 5, 0],
    expectedOutputs: [0, 1, 0, 1, 0],
    maxCycles: 150,
    maxInstructions: 15,
    mapProps: { type: 'enemy', x: 85, y: 35 },
    solution: "IN\nCMP 5\nJEQ 7\nMOV ACC, 0\nOUT\nJMP 1\nMOV ACC, 1\nOUT\nJMP 1"
  },
  {
    id: 23,
    name: "Level 23: Division durch 2 (Ganzzahl)",
    description: "Ganzzahldivision durch 2. Subtrahiere in einer Schleife 2. Wie oft ging das, bis die Zahl < 2 war?",
    inputs: [6, 7, 1, 0],
    expectedOutputs: [3, 3, 0, 0],
    maxCycles: 500,
    maxInstructions: 20,
    mapProps: { type: 'enemy', x: 80, y: 25 },
    solution: "IN\nMOV R2, ACC\nMOV R1, 0\nMOV ACC, R2\nCMP 2\nJLT 11\nSUB 2\nMOV R2, ACC\nMOV ACC, R1\nADD 1\nMOV R1, ACC\nJMP 4\nMOV ACC, R1\nOUT\nJMP 1"
  },
  {
    id: 24,
    name: "Level 24: Modulo 3",
    description: "Was bleibt als Rest, wenn man durch 3 teilt? (Teile so oft, bis der ACC < 3 ist, der Rest ist die Lösung).",
    inputs: [10, 5, 3, 2],
    expectedOutputs: [1, 2, 0, 2],
    maxCycles: 500,
    maxInstructions: 15,
    mapProps: { type: 'enemy', x: 75, y: 15 },
    solution: "IN\nCMP 3\nJLT 6\nSUB 3\nJMP 2\nOUT\nJMP 1"
  },
  {
    id: 25,
    name: "Level 25: Exponentiation (Basis 2)",
    description: "Lies eine Potenz P > 0 als Eingabe. Berechne 2 hoch P (2^P). (Z.B P=3 => 8)",
    inputs: [1, 2, 3, 4],
    expectedOutputs: [2, 4, 8, 16],
    maxCycles: 500,
    maxInstructions: 25,
    mapProps: { type: 'enemy', x: 65, y: 15 },
    solution: "IN\nMOV R1, ACC\nMOV R2, 2\nCMP 1\nJEQ 13\nMOV ACC, R2\nADD R2\nMOV R2, ACC\nMOV ACC, R1\nSUB 1\nMOV R1, ACC\nJMP 4\nMOV ACC, R2\nOUT\nJMP 1"
  },
  {
    id: 26,
    name: "Level 26: Multiplikationsschleife",
    description: "Lies A und B. Multipliziere A * B und gib das Ergebnis aus. (Tipp: Addiere A in einer Schleife B mal).",
    inputs: [2, 3, 4, 5, 0, 10, 10, 0],
    expectedOutputs: [6, 20, 0, 0],
    maxCycles: 600,
    maxInstructions: 25,
    mapProps: { type: 'enemy', x: 55, y: 5 },
    solution: "IN\nMOV R1, ACC\nIN\nMOV R2, ACC\nMOV R3, 0\nMOV ACC, R2\nCMP 0\nJEQ 16\nMOV ACC, R3\nADD R1\nMOV R3, ACC\nMOV ACC, R2\nSUB 1\nMOV R2, ACC\nJMP 6\nMOV ACC, R3\nOUT\nJMP 1"
  },
  {
    id: 27,
    name: "Level 27: Zehner Filtern",
    description: "Zahle nur Zahlen aus, die genau zwischen 10 und 20 liegen inclusive.",
    inputs: [5, 10, 15, 20, 25, 12],
    expectedOutputs: [10, 15, 20, 12],
    maxCycles: 300,
    maxInstructions: 20,
    mapProps: { type: 'enemy', x: 45, y: 5 },
    solution: "IN\nMOV R1, ACC\nCMP 9\nJGT 6\nJMP 1\nMOV ACC, R1\nCMP 21\nJLT 11\nJMP 1\nMOV ACC, R1\nOUT\nJMP 1"
  },
  {
    id: 28,
    name: "Level 28: Durchschnitt von 2",
    description: "Bestimme den mathematisch exakten *ganzzahligen* Durchschnitt (A+B)/2.",
    inputs: [10, 20, 4, 6],
    expectedOutputs: [15, 5],
    maxCycles: 400,
    maxInstructions: 20,
    mapProps: { type: 'enemy', x: 35, y: 5 },
    solution: "IN\nMOV R1, ACC\nIN\nADD R1\nMOV R1, 0\nCMP 2\nJLT 15\nSUB 2\nMOV R2, ACC\nMOV ACC, R1\nADD 1\nMOV R1, ACC\nMOV ACC, R2\nJMP 6\nMOV ACC, R1\nOUT\nJMP 1"
  },
  {
    id: 29,
    name: "Level 29: Duplikate Vermeiden",
    description: "Eine Zahlenreihe kommt an. Ausgegeben wird sie, aber werfe die Zahl weg, wenn sie GENAU der vorherigen Ausgabe entspricht.",
    inputs: [1, 2, 2, 3, 3, 3, 4, 1, 1],
    expectedOutputs: [1, 2, 3, 4, 1],
    maxCycles: 300,
    maxInstructions: 20,
    mapProps: { type: 'enemy', x: 25, y: 5 },
    solution: "IN\nOUT\nMOV R1, ACC\nIN\nCMP R1\nJEQ 4\nOUT\nMOV R1, ACC\nJMP 4"
  },
  {
    id: 30,
    name: "Level 30: Das Finale (Tri-Summe)",
    description: "Lies immer DREI Zahlen A, B, C und gib die Summe A+B+C aus.",
    inputs: [1, 2, 3, 10, 20, 30, -5, 5, 0],
    expectedOutputs: [6, 60, 0],
    maxCycles: 200,
    maxInstructions: 15,
    mapProps: { type: 'enemy', x: 15, y: 5 },
    solution: "IN\nMOV R1, ACC\nIN\nADD R1\nMOV R1, ACC\nIN\nADD R1\nOUT\nJMP 1"
  }
];

const spellPlanByBossId = Object.fromEntries(
  getBossSpellPlan().map((entry) => [entry.bossId, entry])
);

export const levels = baseLevels.map((level) => {
  const spellPlan = spellPlanByBossId[level.id];
  if (!spellPlan) return level;

  const rewardLine = spellPlan.grantedAfterWin
    ? `\n\nReward nach Sieg: Neuer Spell freigeschaltet → ${spellPlan.grantedAfterWin}`
    : '';

  return {
    ...level,
    requiredInstructions: spellPlan.required,
    unlockedInstructions: spellPlan.unlockedBeforeFight,
    rewardInstruction: spellPlan.grantedAfterWin,
    description: `${level.description}${rewardLine}`,
  };
});

