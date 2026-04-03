const BASE_INSTRUCTIONS = ['IN', 'OUT', 'JMP'];

// Genau 1 neuer Spell pro frühem Boss. Ab Boss 8 sind alle Spells freigeschaltet.
const SPELL_REWARDS_BY_BOSS_ID = {
  1: 'ADD',
  2: 'SUB',
  3: 'MOV',
  4: 'CMP',
  5: 'JEQ',
  6: 'JGT',
  7: 'JLT',
};

export const BOSS_FUNCTION_REQUIREMENTS = [
  { bossId: 1, levelName: 'Level 1: Das Erste Programm', required: ['IN', 'OUT', 'JMP'], firstNeededAt: ['IN', 'OUT', 'JMP'] },
  { bossId: 2, levelName: 'Level 2: Arithmetik Plus', required: ['IN', 'ADD', 'OUT', 'JMP'], firstNeededAt: ['ADD'] },
  { bossId: 3, levelName: 'Level 3: Subtraktion', required: ['IN', 'SUB', 'OUT', 'JMP'], firstNeededAt: ['SUB'] },
  { bossId: 4, levelName: 'Level 4: Multiplikation mit 2', required: ['IN', 'MOV', 'ADD', 'OUT', 'JMP'], firstNeededAt: ['MOV'] },
  { bossId: 5, levelName: 'Level 5: Multiplikation mit 3', required: ['IN', 'MOV', 'ADD', 'OUT', 'JMP'], firstNeededAt: ['CMP (benötigt ab Boss 6)'] },
  { bossId: 6, levelName: 'Level 6: Bedingte Ausgabe (Zero)', required: ['IN', 'CMP', 'JEQ', 'MOV', 'OUT', 'JMP'], firstNeededAt: ['CMP', 'JEQ'] },
  { bossId: 7, levelName: 'Level 7: Positivitäts-Filter', required: ['IN', 'CMP', 'JGT', 'JMP', 'OUT'], firstNeededAt: ['JGT'] },
  { bossId: 8, levelName: 'Level 8: Negative Filter', required: ['IN', 'CMP', 'JLT', 'JMP', 'OUT'], firstNeededAt: ['JLT'] },
  { bossId: 9, levelName: 'Level 9: Maximum von Zweien', required: ['IN', 'MOV', 'CMP', 'JGT', 'OUT', 'JMP'], firstNeededAt: [] },
  { bossId: 10, levelName: 'Level 10: Minimum von Zweien', required: ['IN', 'MOV', 'CMP', 'JLT', 'OUT', 'JMP'], firstNeededAt: [] },
  { bossId: 11, levelName: 'Level 11: Absolutwert', required: ['IN', 'CMP', 'JLT', 'OUT', 'JMP', 'MOV', 'SUB'], firstNeededAt: [] },
  { bossId: 12, levelName: 'Level 12: Signum', required: ['IN', 'CMP', 'JEQ', 'JGT', 'MOV', 'OUT', 'JMP'], firstNeededAt: [] },
  { bossId: 13, levelName: 'Level 13: Jede Zweite', required: ['IN', 'OUT', 'JMP'], firstNeededAt: [] },
  { bossId: 14, levelName: 'Level 14: Summe aus Zwei', required: ['IN', 'MOV', 'ADD', 'OUT', 'JMP'], firstNeededAt: [] },
  { bossId: 15, levelName: 'Level 15: Differenz', required: ['IN', 'MOV', 'SUB', 'OUT', 'JMP'], firstNeededAt: [] },
  { bossId: 16, levelName: 'Level 16: Paare Tauschen', required: ['IN', 'MOV', 'OUT', 'JMP'], firstNeededAt: [] },
  { bossId: 17, levelName: 'Level 17: Triple Tausch', required: ['IN', 'MOV', 'OUT', 'JMP'], firstNeededAt: [] },
  { bossId: 18, levelName: 'Level 18: Sequenz Zählen', required: ['MOV', 'IN', 'CMP', 'JEQ', 'ADD', 'JMP', 'OUT'], firstNeededAt: [] },
  { bossId: 19, levelName: 'Level 19: Sequenz Summe', required: ['MOV', 'IN', 'CMP', 'JEQ', 'ADD', 'JMP', 'OUT'], firstNeededAt: [] },
  { bossId: 20, levelName: 'Level 20: Bedingter Tausch (Sortieren)', required: ['IN', 'MOV', 'CMP', 'JLT', 'OUT', 'JMP'], firstNeededAt: [] },
  { bossId: 21, levelName: 'Level 21: Countdown', required: ['IN', 'CMP', 'JEQ', 'OUT', 'SUB', 'JMP'], firstNeededAt: [] },
  { bossId: 22, levelName: 'Level 22: Fünfer Reihe Check', required: ['IN', 'CMP', 'JEQ', 'MOV', 'OUT', 'JMP'], firstNeededAt: [] },
  { bossId: 23, levelName: 'Level 23: Division durch 2 (Ganzzahl)', required: ['IN', 'MOV', 'CMP', 'JLT', 'SUB', 'ADD', 'JMP', 'OUT'], firstNeededAt: [] },
  { bossId: 24, levelName: 'Level 24: Modulo 3', required: ['IN', 'CMP', 'JLT', 'SUB', 'JMP', 'OUT'], firstNeededAt: [] },
  { bossId: 25, levelName: 'Level 25: Exponentiation (Basis 2)', required: ['IN', 'MOV', 'CMP', 'JEQ', 'ADD', 'SUB', 'JMP', 'OUT'], firstNeededAt: [] },
  { bossId: 26, levelName: 'Level 26: Multiplikationsschleife', required: ['IN', 'MOV', 'CMP', 'JEQ', 'ADD', 'SUB', 'JMP', 'OUT'], firstNeededAt: [] },
  { bossId: 27, levelName: 'Level 27: Zehner Filtern', required: ['IN', 'MOV', 'CMP', 'JGT', 'JMP', 'JLT', 'OUT'], firstNeededAt: [] },
  { bossId: 28, levelName: 'Level 28: Durchschnitt von 2', required: ['IN', 'MOV', 'ADD', 'CMP', 'JLT', 'SUB', 'JMP', 'OUT'], firstNeededAt: [] },
  { bossId: 29, levelName: 'Level 29: Duplikate Vermeiden', required: ['IN', 'OUT', 'MOV', 'CMP', 'JEQ', 'JMP'], firstNeededAt: [] },
  { bossId: 30, levelName: 'Level 30: Das Finale (Tri-Summe)', required: ['IN', 'MOV', 'ADD', 'OUT', 'JMP'], firstNeededAt: [] },
];

export const getUnlockedInstructionsForBoss = (bossId) => {
  const unlocked = [...BASE_INSTRUCTIONS];
  for (let i = 1; i < bossId; i++) {
    const reward = SPELL_REWARDS_BY_BOSS_ID[i];
    if (reward && !unlocked.includes(reward)) {
      unlocked.push(reward);
    }
  }
  return unlocked;
};

export const getRewardForBoss = (bossId) => SPELL_REWARDS_BY_BOSS_ID[bossId] || null;

export const getBossSpellPlan = () => BOSS_FUNCTION_REQUIREMENTS.map((boss) => ({
  ...boss,
  unlockedBeforeFight: getUnlockedInstructionsForBoss(boss.bossId),
  grantedAfterWin: getRewardForBoss(boss.bossId),
}));

export const ALL_KNOWN_INSTRUCTIONS = ['IN', 'OUT', 'JMP', 'MOV', 'ADD', 'SUB', 'CMP', 'JEQ', 'JGT', 'JLT'];