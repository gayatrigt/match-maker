import React, { createContext, useContext, useState, useCallback } from 'react';
import { ALL_WORD_PAIRS } from '../data/wordPairs';

interface Card {
  id: number;
  text: string;
  type: 'term' | 'definition';
  isMatched: boolean;
  isSelected: boolean;
  isIncorrect: boolean;
}

interface GameContextType {
  cards: Card[];
  setCards: React.Dispatch<React.SetStateAction<Card[]>>;
  gameStarted: boolean;
  setGameStarted: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCards: number[];
  setSelectedCards: React.Dispatch<React.SetStateAction<number[]>>;
  matchedPairs: number;
  setMatchedPairs: React.Dispatch<React.SetStateAction<number>>;
  currentSet: number;
  setCurrentSet: React.Dispatch<React.SetStateAction<number>>;
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  totalAttempts: number;
  setTotalAttempts: React.Dispatch<React.SetStateAction<number>>;
  initializeGame: (setIndex?: number) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [currentSet, setCurrentSet] = useState(0);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);

  const initializeGame = useCallback((setIndex: number = 0) => {
    const currentWordPairs = ALL_WORD_PAIRS[setIndex];
    const terms: Card[] = currentWordPairs.map((pair, index) => ({
      id: index * 2,
      text: pair.term,
      type: 'term',
      isMatched: false,
      isSelected: false,
      isIncorrect: false,
    }));

    const definitions: Card[] = currentWordPairs.map((pair, index) => ({
      id: index * 2 + 1,
      text: pair.definition,
      type: 'definition',
      isMatched: false,
      isSelected: false,
      isIncorrect: false,
    }));

    const shuffledDefinitions = definitions.sort(() => Math.random() - 0.5);
    setCards([...terms, ...shuffledDefinitions]);
    setSelectedCards([]);
  }, []);

  const resetGame = useCallback(() => {
    setCurrentSet(0);
    setScore(0);
    setTotalAttempts(0);
    setMatchedPairs(0);
    setGameStarted(false);
    setCards([]);
    setSelectedCards([]);
  }, []);

  const value = {
    cards,
    setCards,
    gameStarted,
    setGameStarted,
    selectedCards,
    setSelectedCards,
    matchedPairs,
    setMatchedPairs,
    currentSet,
    setCurrentSet,
    score,
    setScore,
    totalAttempts,
    setTotalAttempts,
    initializeGame,
    resetGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export { GameProvider }; 