import React, { createContext, useContext, useState } from 'react';
import { ALL_WORD_PAIRS } from '../data/wordPairs';

export interface Card {
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
  initializeGame: (setIndex: number) => void;
  resetGame: (preserveScore?: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [currentSet, setCurrentSet] = useState(0);
  const [score, setScore] = useState(0);

  const initializeGame = (setIndex: number) => {
    const currentPairs = ALL_WORD_PAIRS[setIndex];
    if (!currentPairs) return;

    const newCards: Card[] = [
      ...currentPairs.map((pair, index) => ({
        id: index,
        text: pair.term,
        type: 'term' as const,
        isMatched: false,
        isSelected: false,
        isIncorrect: false,
      })),
      ...currentPairs.map((pair, index) => ({
        id: index + currentPairs.length,
        text: pair.definition,
        type: 'definition' as const,
        isMatched: false,
        isSelected: false,
        isIncorrect: false,
      })),
    ];

    // Shuffle the cards
    for (let i = newCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newCards[i], newCards[j]] = [newCards[j], newCards[i]];
    }

    setCards(newCards);
    setSelectedCards([]);
    setMatchedPairs(0);
  };

  const resetGame = (preserveScore: boolean = false) => {
    setGameStarted(false);
    setCards([]);
    setSelectedCards([]);
    setMatchedPairs(0);
    setCurrentSet(0);
    if (!preserveScore) {
      setScore(0);
    }
  };

  return (
    <GameContext.Provider
      value={{
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
        initializeGame,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}; 