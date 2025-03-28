import { useEffect, useState, useRef, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { usePrivy } from '@privy-io/react-auth';
import { usePlayerStats } from '../hooks/usePlayerStats';
import { ALL_WORD_PAIRS } from '../data/wordPairs';
import { GAME_MODES } from '../data/gameModes';
import type { GameMode } from '../data/gameModes';
import 'nes.css/css/nes.min.css';
import './Game.css';
import WelcomeScreen from './WelcomeScreen';
import React from 'react';

const TIMER_DURATION = 60; // 60 seconds per set

// Extracted ModeIntroductionDialog to prevent rerenders
const ModeIntroductionDialog = React.memo(({ 
  currentSet, 
  gameMode, 
  onStart 
}: { 
  currentSet: number, 
  gameMode: GameMode, 
  onStart: () => void 
}) => {
  // Add console.log to help with debugging - only once per modal display
  console.log('Rendering ModeIntroductionDialog for set:', currentSet + 1);
  
  // Wrap onStart to ensure it doesn't get blocked
  const handleStart = () => {
    console.log('Start button clicked');
    // Call onStart in the next tick to avoid React state batching issues
    setTimeout(onStart, 0);
  };
  
  const getModeTips = () => {
    switch (gameMode.name) {
      case 'Classic Mode':
        return "Match terms with definitions at your own pace";
      case 'Speed Rush':
        return "Quick matches earn bonus XP - build those combo chains!";
      case 'Memory Master':
        return "Memorize card positions during preview phase";
      case 'Chain Combo':
        return "Keep matching quickly to increase your combo multiplier";
      case 'Chaos Mode':
        return "Cards shuffle periodically - stay alert!";
      default:
        return "Match terms with definitions to earn points and XP";
    }
  };

  return (
    <div className="modal-overlay">
      <div className="nes-container is-rounded mode-intro-dialog">
        <h2>{gameMode.name}</h2>
        <div className="mode-rules">
          <p className="mode-description">{getModeTips()}</p>
          
          <div className="mode-mechanics">
            <ul>
              <li>⏱️ {gameMode.timeLimit}s</li>
              <li>⭐ {gameMode.xpMultiplier}x XP</li>
              {gameMode.specialRules.chainCombo && (
                <li>🔗 Chain Bonus Active</li>
              )}
              {gameMode.specialRules.memoryPhase && (
                <li>🧠 5s Preview Phase</li>
              )}
              {gameMode.specialRules.shuffleInterval && (
                <li>🔄 {gameMode.specialRules.shuffleInterval}s Shuffle</li>
              )}
            </ul>
          </div>

          <div className="set-progress">
            <p className="set-number-display">Set {currentSet + 1} of {ALL_WORD_PAIRS.length}</p>
          </div>
        </div>
        
        <button className="nes-btn is-primary" onClick={handleStart}>
          Start
        </button>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Special case for first login - always render
  if (prevProps.currentSet === 0 && nextProps.currentSet === 0) {
    return false;
  }
  
  // Only rerender if currentSet or gameMode changes
  return prevProps.currentSet === nextProps.currentSet && 
         prevProps.gameMode.name === nextProps.gameMode.name;
});

const Game = () => {
  const { user, authenticated, login } = usePrivy();
  const { updateStats, stats } = usePlayerStats();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSaveScore, setShowSaveScore] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [highestScore, setHighestScore] = useState(0);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showTip, setShowTip] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [currentGameMode, setCurrentGameMode] = useState<GameMode>(GAME_MODES[0]);
  const [lastMatchTime, setLastMatchTime] = useState<number>(0);
  const [comboCount, setComboCount] = useState(0);
  const [showMemoryPhase, setShowMemoryPhase] = useState(false);
  const [showModeIntro, setShowModeIntro] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const lastIntroSetRef = useRef<number>(0);

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
      console.log('Auth detected, starting game');
      startGame();
    }
  }, [authenticated, gameStarted]);

  // Update stats when score changes
  useEffect(() => {
    const updatePlayerStats = async () => {
      if (user?.wallet?.address && score > 0) {
        console.log('Updating stats from score effect. Current score:', score, 'Mode:', currentGameMode.name);
        try {
          const response = await updateStats(score, currentGameMode);
          if (response) {
            setHighestScore(Math.max(response.score, highestScore));
          }
        } catch (error) {
          console.error('Error updating stats:', error);
        }
      }
    };

    updatePlayerStats();
  }, [score, user?.wallet?.address]);

  // Update game mode effect to handle initialization properly and prevent duplicate animations
  useEffect(() => {
    // Don't interfere with the first login modal
    if (lastIntroSetRef.current === -1) {
      console.log('Skipping game mode effect for first login');
      return;
    }
    
    // Skip effect execution if it would cause a modal reload
    if (showModeIntro) return;
    
    // Skip if game is already started to prevent modal from reappearing
    if (gameStarted) return;
    
    const modeIndex = Math.floor(currentSet / 2) % GAME_MODES.length;
    const newMode = GAME_MODES[modeIndex];
    console.log('Updating game mode for set:', currentSet, 'New mode:', newMode.name);
    
    setCurrentGameMode(newMode);
    setTimeLeft(newMode.timeLimit);
    
    // Reset states
    setComboCount(0);
    
    // Single timer id for modal display to prevent double-showing
    let timerId: NodeJS.Timeout | null = null;
    
    // Show mode intro for new modes, but only if we haven't shown it for this set already
    if (currentSet % 2 === 0 && lastIntroSetRef.current !== currentSet) {
      console.log('New mode detected, showing intro for set:', currentSet);
      // Update the ref to track that we've shown the intro for this set
      lastIntroSetRef.current = currentSet;
      
      // Instead of showing right away, debounce it to prevent multiple calls
      if (timerId) clearTimeout(timerId);
      timerId = setTimeout(() => {
        // Show intro dialog
        setShowModeIntro(true);
        setGameStarted(false);
      }, 100);
    }
    
    // Handle memory phase mode
    if (newMode.specialRules.memoryPhase) {
      setShowMemoryPhase(true);
      const timer = setTimeout(() => setShowMemoryPhase(false), 5000);
      return () => {
        clearTimeout(timer);
        if (timerId) clearTimeout(timerId);
      };
    }
    
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [currentSet, showModeIntro, gameStarted]);

  // Update timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
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
  }, [gameStarted]);

  // Handle card shuffling for Chaos Mode
  useEffect(() => {
    let shuffleTimer: NodeJS.Timeout;
    if (gameStarted && currentGameMode.specialRules.shuffleInterval) {
      shuffleTimer = setInterval(() => {
        const shuffledCards = [...cards].sort(() => Math.random() - 0.5);
        setCards(shuffledCards);
      }, currentGameMode.specialRules.shuffleInterval * 1000);
    }
    return () => {
      if (shuffleTimer) clearInterval(shuffleTimer);
    };
  }, [gameStarted, currentGameMode]);

  // Create a stable reference for the handleGameStart function
  const handleGameStart = useCallback(() => {
    console.log('Starting game mode:', currentGameMode.name, 'for set:', currentSet);
    
    // Set the modal closed first to prevent race conditions
    setShowModeIntro(false);
    
    // Update lastIntroSetRef to mark that we've handled this set
    lastIntroSetRef.current = currentSet;
    
    // Short delay before other state changes to ensure modal is closed
    setTimeout(() => {
      // Clear any existing states
      setSelectedCards([]);
      setMatchedPairs(0);
      setComboCount(0);
      
      // Initialize the current set
      initializeGame(currentSet);
      
      // Clear other dialogs
      setShowTip(false);
      
      // Start the game
      setGameStarted(true);
      setTimeLeft(currentGameMode.timeLimit);
      
      console.log('Game started with timeLimit:', currentGameMode.timeLimit);
    }, 50);
  }, [currentSet, currentGameMode, setGameStarted, initializeGame, setShowModeIntro, setSelectedCards, setMatchedPairs, setComboCount, setTimeLeft, setShowTip]);

  // Update handleTimeUp to show game over dialog
  const handleTimeUp = () => {
    console.log('Time up! Final score:', score);
    setGameStarted(false);
    setShowGameOver(true);
    setIsProcessing(false);
  };

  // Update moveToNextSet to properly handle transitions
  const moveToNextSet = async () => {
    const nextSetIndex = currentSet + 1;
    console.log('Moving to next set:', nextSetIndex, 'Total sets:', ALL_WORD_PAIRS.length);
    
    if (nextSetIndex < ALL_WORD_PAIRS.length) {
      try {
        // Update stats first
        if (user?.wallet?.address) {
          const response = await updateStats(score, currentGameMode);
          if (response) {
            setHighestScore(Math.max(response.score, highestScore));
          }
        }
        
        // Show completion message
        showMessage("Set Complete!", 'success');
        
        // Clear game states and update to next set immediately
        setGameStarted(false);
        setSelectedCards([]);
        setMatchedPairs(0);
        setComboCount(0);
        setIsProcessing(false);
        
        // First update the currentSet to prevent unnecessary modal renders
        setCurrentSet(nextSetIndex);
        
        // Then initialize the next set after a small delay 
        // to ensure state updates are processed
        setTimeout(() => {
          initializeGame(nextSetIndex);
        }, 50);
      } catch (error) {
        console.error('Error moving to next set:', error);
      }
    } else {
      // Handle game completion
      setShowGameOver(true);
      setGameStarted(false);
    }
  };

  // Start game
  const startGame = async () => {
    try {
      console.log('Starting new game, first login');
      
      // First reset and initialize game state
      resetGame();
      initializeGame(0);
      setGameStarted(false); // Ensure game starts in stopped state
      setTimeLeft(currentGameMode.timeLimit);
      
      // IMPORTANT: Show the modal with a small delay to ensure React has time to process the state
      setTimeout(() => {
        // Force display of the intro modal
        lastIntroSetRef.current = -1; // Special value for first login
        setShowModeIntro(true);
        console.log('Setting showModeIntro to true for first login');
      }, 100);
      
      // Load initial stats
      if (user?.wallet?.address) {
        const response = await updateStats(0, currentGameMode);
        if (response) {
          setHighestScore(response.score);
        }
      }
    } catch (error) {
      console.error('Error starting game:', error);
      showMessage('Failed to start game. Please try again.', 'error');
    }
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

  // Modified handleCardClick to include special rules
  const handleCardClick = (cardId: number) => {
    if (isProcessing || cards[cardId].isMatched || showMemoryPhase || !gameStarted) return;

    const updatedCards = [...cards];
    const clickedCard = updatedCards[cardId];

    // Prevent clicking the same card
    if (selectedCards.includes(cardId)) return;

    // Handle invisible cards mode
    if (currentGameMode.specialRules.invisibleCards) {
    updatedCards[cardId].isSelected = true;
    setCards(updatedCards);
      setSelectedCards([cardId]);
      return;
    }

    // First card selection
    if (selectedCards.length === 0) {
      clickedCard.isSelected = true;
      setCards(updatedCards);
      setSelectedCards([cardId]);
      return;
    }

    // Second card selection (matching attempt)
    if (selectedCards.length === 1) {
      const firstCard = cards[selectedCards[0]];
      
      // Prevent matching same type cards
      if (firstCard.type === clickedCard.type) {
        // Use a single state update
        const newCards = [...cards];
        newCards[selectedCards[0]].isSelected = false;
        newCards[cardId].isSelected = true;
        setCards(newCards);
        setSelectedCards([cardId]);
        return;
      }

      setIsProcessing(true);
      clickedCard.isSelected = true;
      setCards(updatedCards);

        const isMatch = ALL_WORD_PAIRS[currentSet].some(pair => 
        (pair.term === firstCard.text && pair.definition === clickedCard.text) ||
        (pair.definition === firstCard.text && pair.term === clickedCard.text)
        );

        if (isMatch) {
        handleCorrectMatch(updatedCards, cardId);
      } else {
        handleIncorrectMatch(firstCard, clickedCard, updatedCards);
      }
    }
  };

  // Separate correct match handling for cleaner code
  const handleCorrectMatch = (updatedCards: any[], cardId: number) => {
    const now = Date.now();
    const baseXP = 1;
    let finalXP = baseXP * (currentGameMode.xpMultiplier || 1);
    let newComboCount = comboCount;
    
    if (currentGameMode.specialRules.chainCombo && lastMatchTime && (now - lastMatchTime) < 3000) {
      newComboCount = comboCount + 1;
      const bonusMultiplier = Math.min(newComboCount * 0.5, 2);
      finalXP *= (1 + bonusMultiplier);
      console.log(`Chain bonus! Combo: ${newComboCount}, Bonus: ${bonusMultiplier}x, XP: ${finalXP}`);
        } else {
      newComboCount = 1;
      console.log(`Regular match! Mode: ${currentGameMode.name}, XP: ${finalXP}`);
    }

    // Batch state updates
    const newScore = score + 1;
    const newMatchedPairs = matchedPairs + 1;
    const totalPairsInSet = ALL_WORD_PAIRS[currentSet].length;
    
    // Update all states at once
    Promise.resolve().then(() => {
      setScore(newScore);
      setComboCount(newComboCount);
      setLastMatchTime(now);
      
      // Update card states
      updatedCards[selectedCards[0]].isMatched = true;
      updatedCards[cardId].isMatched = true;
        updatedCards[selectedCards[0]].isSelected = false;
        updatedCards[cardId].isSelected = false;
        setCards(updatedCards);
        setSelectedCards([]);
      setMatchedPairs(newMatchedPairs);
      setIsProcessing(false);
      
      // Check if set is complete
      if (newMatchedPairs === totalPairsInSet) {
        console.log('Set complete! Moving to next set...');
        moveToNextSet();
      }
      
      // Update stats if connected
      if (user?.wallet?.address) {
        updateStats(newScore, currentGameMode)
          .then(response => {
            if (response) {
              setHighestScore(Math.max(response.score, highestScore));
            }
          })
          .catch(error => {
            console.error('Error updating stats:', error);
          });
      }
    });
  };

  // Add helper function for handling incorrect matches
  const handleIncorrectMatch = (firstCard: any, clickedCard: any, updatedCards: any[]) => {
    // Reset combo on wrong match
    setComboCount(0);
    
    // Find the correct match
    const correctPair = ALL_WORD_PAIRS[currentSet].find(pair => 
      (firstCard.type === 'term' && pair.term === firstCard.text) ||
      (firstCard.type === 'definition' && pair.definition === firstCard.text)
    );
    
    const correct = firstCard.type === 'term' ? correctPair?.definition : correctPair?.term;

    setShowSaveScore(false);
    setCorrectAnswer('');
    
    // Trigger screen shake
    triggerScreenShake();
    
    setTimeout(() => {
      setCorrectAnswer(correct || '');
      updatedCards[selectedCards[0]].isIncorrect = true;
      updatedCards[cards.indexOf(clickedCard)].isIncorrect = true;
      setCards(updatedCards);
      setShowSaveScore(true);
    }, 50);

    setTimeout(() => {
      const resetCards = [...updatedCards];
      resetCards[selectedCards[0]].isIncorrect = false;
      resetCards[cards.indexOf(clickedCard)].isIncorrect = false;
      resetCards[selectedCards[0]].isSelected = false;
      resetCards[cards.indexOf(clickedCard)].isSelected = false;
      setCards(resetCards);
      setSelectedCards([]);
      setIsProcessing(false);
    }, 500);
  };

  // Update the matchedPairs effect to handle set completion
  useEffect(() => {
    if (matchedPairs === 5) {
      console.log('Set completed! Current score:', score, 'Current set:', currentSet);
      // Move to next set immediately
        moveToNextSet();
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

  // Add function to handle game restart
  const handleRestartGame = () => {
    console.log('Restarting game from beginning');
    setShowGameOver(false);
    setScore(0);
    setCurrentSet(0);
    setMatchedPairs(0);
    setComboCount(0);
    resetGame();
    initializeGame(0);
    setTimeLeft(currentGameMode.timeLimit);
    setGameStarted(true);
  };

  // Add GameOverDialog component
  const GameOverDialog = () => (
    <div className="modal-overlay">
      <div className="nes-container is-rounded game-over-dialog">
        <h2>Game Over!</h2>
        <div className="game-stats">
          <p>Final Score: <span className="nes-text is-primary">{score}</span></p>
          <p>Best Score: <span className="nes-text is-success">{highestScore}</span></p>
          <p>Total XP: <span className="nes-text is-warning">{stats?.xp || 0}</span></p>
          <p>Sets Completed: <span className="nes-text is-primary">{currentSet}</span></p>
        </div>
        <div className="game-over-buttons">
          <button className="nes-btn is-primary" onClick={handleRestartGame}>
            Play Again
          </button>
        </div>
      </div>
    </div>
  );

  const handlePlay = () => {
    login();  // Use Privy's login method
  };

  // Special handling for rendering based on authentication state
  if (!authenticated) {
    return <WelcomeScreen onPlay={handlePlay} />;
  }
  
  // Debug logging for authenticated state
  console.log('Auth render - showModeIntro:', showModeIntro, 'gameStarted:', gameStarted, 'lastIntroSetRef:', lastIntroSetRef.current);

  return (
    <div className={`game-container ${isShaking ? 'shake' : ''}`}>
      <div className="game-content">
        {/* Toast Message */}
        {showToast && (
          <div className={`toast-message ${showToast.type === 'success' ? 'success' : 'error'}`}>
            {showToast.message}
          </div>
        )}

        {/* Mode Introduction Dialog with console log before rendering */}
        {(() => {
          if (showModeIntro) {
            console.log('Rendering ModeIntroductionDialog on return', currentSet, currentGameMode.name);
            return <ModeIntroductionDialog currentSet={currentSet} gameMode={currentGameMode} onStart={handleGameStart} />;
          }
          return null;
        })()}

        {/* Game Over Dialog */}
        {showGameOver && <GameOverDialog />}

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
                <p className="tip-content">{currentGameMode.description}</p>
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

        {/* Show current game mode */}
        <div className="mode-indicator">
          <span className="nes-text is-primary">Mode: {currentGameMode.name}</span>
          {comboCount > 1 && currentGameMode.specialRules.chainBonus && (
            <span className="combo-counter">Combo x{comboCount}!</span>
          )}
        </div>

        {/* Memory Phase Overlay */}
        {showMemoryPhase && (
          <div className="memory-phase-overlay">
            <h3>Memorize the cards!</h3>
            <div className="countdown">{Math.ceil(timeLeft)}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game; 