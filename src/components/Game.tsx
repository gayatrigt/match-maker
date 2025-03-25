import { useEffect, useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { usePrivy } from '@privy-io/react-auth';
import { usePlayerStats } from '../hooks/usePlayerStats';
import { ALL_WORD_PAIRS } from '../data/wordPairs';
import { TIPS } from '../data/tips';
import 'nes.css/css/nes.min.css';
import './Game.css';

const TIMER_DURATION = 60; // 60 seconds per set

const Game = () => {
  const { user, authenticated, login } = usePrivy();
  const { updateStats, stats } = usePlayerStats();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSaveScore, setShowSaveScore] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [highestScore, setHighestScore] = useState(0);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showTip, setShowTip] = useState(false);
  const [currentTip, setCurrentTip] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showGameStart, setShowGameStart] = useState(false);

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

  // Start game automatically when user logs in
  useEffect(() => {
    if (authenticated && !gameStarted) {
      startGame();
    }
  }, [authenticated]);

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

  // Timer effect - only run when gameStarted is true
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameStarted, timeLeft]);

  const getRandomTip = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * TIPS.length);
    return TIPS[randomIndex];
  }, []);

  const handleTimeUp = () => {
    showMessage("Time's up!", 'error');
    setMatchedPairs(0);
    setGameStarted(false); // Stop the timer
    initializeGame(currentSet);
    setTimeLeft(TIMER_DURATION);
  };

  // Move to next set with tip
  const moveToNextSet = async () => {
    const nextSetIndex = currentSet + 1;
    console.log('Attempting to move to next set:', nextSetIndex, 'Total sets:', ALL_WORD_PAIRS.length);
    
    if (nextSetIndex < ALL_WORD_PAIRS.length) {
      // Calculate the total score after completing this set
      const newScore = score;
      
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
      
      setGameStarted(false); // Stop the timer
      setCurrentTip(getRandomTip());
      setShowTip(true);
      setCurrentSet(nextSetIndex);
    } else {
      showMessage("Game Complete!", 'success');
    }
  };

  // Start game
  const startGame = async () => {
    try {
      resetGame();
      initializeGame(0);
      setShowGameStart(true);
      
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

  const handleGameStart = () => {
    setShowGameStart(false);
    setGameStarted(true);
    setTimeLeft(TIMER_DURATION);
  };

  const handleContinueAfterTip = () => {
    setShowTip(false);
    setMatchedPairs(0);
    initializeGame(currentSet);
    setGameStarted(true); // Start the game when user clicks continue
    setTimeLeft(TIMER_DURATION);
  };

  const triggerScreenShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  // Handle card click with speed bonus
  const handleCardClick = (cardId: number) => {
    if (isProcessing || cards[cardId].isMatched) return;

    const updatedCards = [...cards];
    const clickedCard = updatedCards[cardId];

    // If it's the first selection, start the timer
    if (selectedCards.length === 0) {
      clickedCard.isSelected = true;
      setCards(updatedCards);
      setSelectedCards([cardId]);
      return;
    }

    // If it's the second selection (matching attempt)
    if (selectedCards.length === 1) {
      const firstCard = cards[selectedCards[0]];
      
      // Prevent matching two terms or two definitions
      if (firstCard.type === clickedCard.type) {
        updatedCards[selectedCards[0]].isSelected = false;
        setCards(updatedCards);
        setSelectedCards([cardId]);
        clickedCard.isSelected = true;
        return;
      }

      setIsProcessing(true);
      updatedCards[cardId].isSelected = true;
      setCards(updatedCards);

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
        
        // Trigger screen shake for wrong answer
        triggerScreenShake();
        
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

  // Error dialog restart set handler
  const handleRestartSet = () => {
    setScore(0);
    setMatchedPairs(0);
    setTimeLeft(TIMER_DURATION);
    initializeGame(currentSet);
    setShowSaveScore(false);
  };

  if (!authenticated) {
    return (
      <div className="welcome-container">
        <div className="nes-container is-rounded welcome-box">
          <h1>Welcome to Match Maker!</h1>
          <p>Level up your Web3 knowledge through this memory game.</p>
          <button className="nes-btn is-primary" onClick={login}>
            Connect to Start Playing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`game-container ${isShaking ? 'shake' : ''}`}>
      <div className="game-content">
        {/* Toast Message */}
        {showToast && (
          <div className={`toast-message ${showToast.type === 'success' ? 'success' : 'error'}`}>
            {showToast.message}
          </div>
        )}

        {/* Game Start Screen */}
        {showGameStart && (
          <div className="modal-overlay">
            <div className="nes-container is-rounded game-start-dialog">
              <h2>Welcome to Match Maker!</h2>
              <div className="game-rules">
                <p>🎮 How to Play:</p>
                <ul>
                  <li>Match Web3 terms with their definitions</li>
                  <li>Complete each set within 60 seconds</li>
                  <li>Learn as you play and climb the leaderboard</li>
                </ul>
              </div>
              <p className="set-info">Ready to start Set 1?</p>
              <button className="nes-btn is-primary" onClick={handleGameStart}>
                Let's Begin!
              </button>
            </div>
          </div>
        )}

        {/* Top bar */}
        <div className="nes-container is-rounded score-container">
          <div className="score-row">
            <span className="nes-text is-primary">Score: {score}</span>
            <span className="nes-text is-error">Time: {timeLeft}s</span>
            <span className="nes-text is-success">Best: {highestScore}</span>
            <span className="nes-text is-warning">XP: {stats?.xp || 0}</span>
          </div>
          <div className="progress-bar">
            <progress 
              className="nes-progress" 
              value={matchedPairs * 20} 
              max="100"
              style={{ height: '20px' }}
            />
          </div>
        </div>

        {/* Instructions */}
        <p className="nes-text game-instructions">
          {authenticated ? "Match the Web3 terms with their definitions" : "Please login to play"}
        </p>

        {/* Login Button */}
        {!authenticated && (
          <button
            onClick={login}
            className="nes-btn is-primary login-button"
          >
            Login
          </button>
        )}

        {/* Game grid */}
        {authenticated && (
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
                  onClick={handleRestartSet}
                >
                  Restart Set
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tip Modal */}
        {showTip && (
          <div className="modal-overlay">
            <div className="tip-modal">
              <div className="nes-container is-rounded">
                <h3 className="title">Web3 Tip!</h3>
                <p className="tip-content">{currentTip}</p>
                <p className="progress-text">
                  Set {currentSet} Complete! Ready for Set {currentSet + 1}?
                </p>
                <button
                  className="nes-btn is-primary continue-button"
                  onClick={handleContinueAfterTip}
                >
                  Start Next Set
                </button>
                <p className="progress-text">
                  Set {currentSet + 1} of {ALL_WORD_PAIRS.length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game; 