import { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { usePrivy } from '@privy-io/react-auth';
import { usePlayerStats } from '../hooks/usePlayerStats';
import { ALL_WORD_PAIRS } from '../data/wordPairs';
import 'nes.css/css/nes.min.css';
import './Game.css';

interface Card {
  id: number;
  text: string;
  type: 'term' | 'definition';
  isMatched: boolean;
  isSelected: boolean;
  isIncorrect: boolean;
}

const Game = () => {
  const { user } = usePrivy();
  const { updateStats, stats } = usePlayerStats();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSaveScore, setShowSaveScore] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [highestScore, setHighestScore] = useState(0);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const {
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
  } = useGame();

  const getCardColor = (card: Card) => {
    if (card.isMatched) return '#92CC41';
    if (card.isIncorrect) return '#E76E55';
    if (card.isSelected) return '#209CEE';
    return '#ffffff';
  };

  const getCardAnimation = (card: Card) => {
    if (card.isMatched || card.isIncorrect) {
      return 'pulse 0.5s ease-in-out';
    }
    return 'none';
  };

  // Update stats when score changes
  useEffect(() => {
    const updatePlayerStats = async () => {
      if (user?.wallet?.address && score > 0) {
        const response = await updateStats(score);
        if (response) {
          setHighestScore(Math.max(response.score, highestScore));
        }
      }
    };

    updatePlayerStats();
  }, [score, user?.wallet?.address]);

  // Start game
  const startGame = async () => {
    try {
      resetGame();
      initializeGame(0);
      setGameStarted(true);
      
      // Load initial stats
      if (user?.wallet?.address) {
        const response = await updateStats(0);
        if (response) {
          setHighestScore(response.score);
        }
      }
    } catch (error) {
      console.error('Error starting game:', error);
      showMessage('Failed to start game. Please try again.', 'error');
    }
  };

  // Move to next set
  const moveToNextSet = async () => {
    const nextSetIndex = currentSet + 1;
    console.log('Attempting to move to next set:', nextSetIndex, 'Total sets:', ALL_WORD_PAIRS.length);
    
    if (nextSetIndex < ALL_WORD_PAIRS.length) {
      // Calculate the total score after completing this set
      const newScore = score;
      
      console.log('Moving to next set. Current set:', currentSet, 'Next set:', nextSetIndex, 'Score:', newScore);
      
      if (user?.wallet?.address) {
        console.log('Updating stats');
        try {
          const response = await updateStats(Math.max(newScore, highestScore));
          
          if (response) {
            setHighestScore(Math.max(response.score, highestScore));
            showMessage("Set Complete!", 'success');
          }
        } catch (error) {
          console.error('Error updating stats:', error);
        }
      } else {
        console.log('No wallet address found when completing set');
        showMessage("Set Complete!", 'success');
      }
      
      setCurrentSet(nextSetIndex);
      setTimeout(() => {
        console.log('Initializing game for set:', nextSetIndex);
        setMatchedPairs(0);
        initializeGame(nextSetIndex);
      }, 100);
      
    } else {
      showMessage("Game Complete!", 'success');
    }
  };

  // Handle card click
  const handleCardClick = (cardId: number) => {
    if (!gameStarted) return;
    if (isProcessing) return;
    if (cards[cardId].isMatched) return;
    if (showSaveScore) return;

    const clickedCard = cards[cardId];
    const updatedCards = [...cards];

    // If clicking the same card, do nothing
    if (selectedCards.includes(cardId)) return;

    // If it's the first selection or switching between terms
    if (selectedCards.length === 0 || (selectedCards.length === 1 && clickedCard.type === cards[selectedCards[0]].type)) {
      // Clear previous selection if switching between same type (terms or definitions)
      if (selectedCards.length === 1) {
        updatedCards[selectedCards[0]].isSelected = false;
        setSelectedCards([]);
      }
      
      // Select the new card
      updatedCards[cardId].isSelected = true;
      setCards(updatedCards);
      setSelectedCards([cardId]);
      return;
    }

    // If it's the second selection (matching attempt)
    if (selectedCards.length === 1) {
      setIsProcessing(true);
      updatedCards[cardId].isSelected = true;
      setCards(updatedCards);

      const firstCard = cards[selectedCards[0]];
      const secondCard = clickedCard;

      const isMatch = ALL_WORD_PAIRS[currentSet].some(pair => 
        (pair.term === firstCard.text && pair.definition === secondCard.text) ||
        (pair.definition === firstCard.text && pair.term === secondCard.text)
      );

      if (isMatch) {
        updatedCards[selectedCards[0]].isMatched = true;
        updatedCards[cardId].isMatched = true;
        updatedCards[selectedCards[0]].isSelected = false;
        updatedCards[cardId].isSelected = false;
        setCards(updatedCards);
        setSelectedCards([]);
        setMatchedPairs(prev => prev + 1);
        setScore(prev => prev + 1);
        setIsProcessing(false);
      } else {
        // Find the correct match for the first selected card
        const correctPair = ALL_WORD_PAIRS[currentSet].find(pair => 
          (firstCard.type === 'term' && pair.term === firstCard.text) ||
          (firstCard.type === 'definition' && pair.definition === firstCard.text)
        );
        
        const correct = firstCard.type === 'term' ? correctPair?.definition : correctPair?.term;

        setShowSaveScore(false);
        setCorrectAnswer('');
        
        setTimeout(() => {
          setCorrectAnswer(correct || '');
          updatedCards[selectedCards[0]].isIncorrect = true;
          updatedCards[cardId].isIncorrect = true;
          setCards(updatedCards);
          setShowSaveScore(true);
        }, 50);

        setTimeout(() => {
          const resetCards = [...updatedCards];
          resetCards[selectedCards[0]].isIncorrect = false;
          resetCards[cardId].isIncorrect = false;
          resetCards[selectedCards[0]].isSelected = false;
          resetCards[cardId].isSelected = false;
          setCards(resetCards);
          setSelectedCards([]);
          setIsProcessing(false);
        }, 500);
      }
    }
  };

  useEffect(() => {
    if (matchedPairs === 5) {
      console.log('Set completed! Current score:', score, 'Current set:', currentSet);
      setTimeout(() => {
        moveToNextSet();
      }, 1000);
    }
  }, [matchedPairs]);

  const showMessage = (message: string, type: 'success' | 'error') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  return (
    <div className="game-container">
      <div className="game-content">
        {/* Toast Message */}
        {showToast && (
          <div className={`toast-message ${showToast.type === 'success' ? 'success' : 'error'}`}>
            {showToast.message}
          </div>
        )}

        {/* Top bar */}
        <div className="nes-container is-rounded score-container">
          <div className="progress-bar">
            <progress 
              className="nes-progress" 
              value={matchedPairs * 20} 
              max="100"
              style={{ height: '20px' }}
            />
          </div>
          <div className="score-row">
            <span className="nes-text is-primary">Score: {score}</span>
            <span className="nes-text is-success">Best: {highestScore}</span>
            <span className="nes-text is-warning">XP: {stats?.xp || 0}</span>
          </div>
        </div>

        {/* Instructions */}
        <p className="nes-text game-instructions">
          Match the Web3 terms with their definitions
        </p>

        {/* Game grid */}
        <div className="game-grid">
          {/* Terms Column */}
          <div className="card-column">
            {cards.filter(card => card.type === 'term').map((card) => (
              <button
                key={card.id}
                className={`nes-btn card-button ${
                  card.isMatched ? 'is-success' : 
                  card.isIncorrect ? 'is-error' : 
                  card.isSelected ? 'is-primary' : ''
                }`}
                onClick={() => handleCardClick(cards.indexOf(card))}
                disabled={card.isMatched || !gameStarted}
              >
                {card.text}
              </button>
            ))}
          </div>

          {/* Definitions Column */}
          <div className="card-column">
            {cards.filter(card => card.type === 'definition').map((card) => (
              <button
                key={card.id}
                className={`nes-btn card-button ${
                  card.isMatched ? 'is-success' : 
                  card.isIncorrect ? 'is-error' : 
                  card.isSelected ? 'is-primary' : ''
                }`}
                onClick={() => handleCardClick(cards.indexOf(card))}
                disabled={card.isMatched || !gameStarted}
              >
                {card.text}
              </button>
            ))}
          </div>
        </div>

        {/* Start button */}
        {!gameStarted && (
          <button
            className="nes-btn is-primary start-button"
            onClick={startGame}
          >
            Start Game
          </button>
        )}

        {/* Error Dialog */}
        {showSaveScore && (
          <div className="modal-overlay">
            <div className="nes-container is-rounded with-title error-dialog">
              <p className="title">Wrong Match!</p>
              <div className="dialog-content">
                <p>The correct match was:</p>
                <p className="nes-text is-primary">
                  {cards[selectedCards[0]]?.text} → {correctAnswer}
                </p>
                <button
                  className="nes-btn is-error"
                  onClick={() => {
                    setScore(0);
                    setMatchedPairs(0);
                    initializeGame(currentSet);
                    setShowSaveScore(false);
                  }}
                >
                  Restart Set
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game; 