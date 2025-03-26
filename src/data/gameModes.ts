export interface GameMode {
  name: string;
  description: string;
  timeLimit: number;
  xpMultiplier: number;  // Added XP multiplier
  specialRules: {
    invisibleCards?: boolean;
    cardFlipDelay?: number;  // Time in ms before cards flip back
    shuffleInterval?: number;  // Shuffle cards every X seconds
    chainBonus?: boolean;  // Bonus points for quick successive matches
    memoryPhase?: boolean;  // Show all cards briefly at start
    chainCombo?: boolean;
    speedRound?: boolean;
  };
}

export const GAME_MODES: GameMode[] = [
  {
    name: "Classic Mode",
    description: "Match pairs within the time limit. A perfect way to start!",
    timeLimit: 60,
    xpMultiplier: 1,
    specialRules: {}
  },
  {
    name: "Chain Combo Mode",
    description: "Quick matches build up your combo multiplier!",
    timeLimit: 45,
    xpMultiplier: 1.5,
    specialRules: {
      chainCombo: true
    }
  },
  {
    name: "Memory Challenge",
    description: "Memorize the cards before they flip! Test your memory.",
    timeLimit: 40,
    xpMultiplier: 2,
    specialRules: {
      memoryPhase: true
    }
  },
  {
    name: "Speed Round",
    description: "Race against time with shorter rounds!",
    timeLimit: 30,
    xpMultiplier: 2.5,
    specialRules: {
      speedRound: true
    }
  },
  {
    name: "Chaos Mode",
    description: "Cards shuffle periodically! Stay focused.",
    timeLimit: 50,
    xpMultiplier: 3,
    specialRules: {
      shuffleInterval: 5,
      chainCombo: true
    }
  }
]; 