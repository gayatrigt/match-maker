import { useEffect, useState, useRef, useCallback } from 'react';
import React from 'react';
import { useGame } from '../context/GameContext';
import { usePrivy } from '@privy-io/react-auth';
import { usePlayerStats } from '../hooks/usePlayerStats';
import { ALL_WORD_PAIRS } from '../data/wordPairs';
import { GAME_MODES } from '../data/gameModes';
import type { GameMode } from '../data/gameModes';
import 'nes.css/css/nes.min.css';
import './Game.css';
import WelcomeScreen from './WelcomeScreen';

const TIMER_DURATION = 60;

// Create an isolated ModeIntroDialog component outside the main component
// This prevents re-renders from parent state changes
const ModeIntroDialog = React.memo(({ 
  mode, 
  currentSet, 
  totalSets, 
  onStart 
}: { 
  mode: GameMode; 
  currentSet: number; 
  totalSets: number; 
  onStart: () => void 
}) => {
  // This function is inside the component to avoid prop drilling
  const getModeTips = useCallback(() => {
    switch (mode.name) {
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
  }, [mode.name]);

  // Clean click handler with no dependencies
  const handleClick = useCallback(() => {
    onStart();
  }, [onStart]);

  return (
    <div className="modal-overlay">
      <div className="nes-container is-rounded mode-intro-dialog">
        <h2>{mode.name}</h2>
        <div className="mode-rules">
          <p className="mode-description">{getModeTips()}</p>
          
          <div className="mode-mechanics">
            <ul>
              <li>⏱️ {mode.timeLimit}s</li>
              <li>⭐ {mode.xpMultiplier}x XP</li>
              {mode.specialRules.chainCombo && (
                <li>🔗 Chain Bonus Active</li>
              )}
              {mode.specialRules.memoryPhase && (
                <li>🧠 5s Preview Phase</li>
              )}
              {mode.specialRules.shuffleInterval && (
                <li>🔄 {mode.specialRules.shuffleInterval}s Shuffle</li>
              )}
            </ul>
          </div>

          <div className="set-progress">
            <p>Set {currentSet + 1} of {totalSets}</p>
          </div>
        </div>
        
        <button
          className="nes-btn is-primary"
          onClick={handleClick}
        >
          Start
        </button>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return prevProps.currentSet === nextProps.currentSet && 
         prevProps.mode.name === nextProps.mode.name;
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
  const [showGameOver, setShowGameOver] = useState(false);
  
  // Simplified dialog state - just a boolean
  const [showDialog, setShowDialog] = useState(false);
  
  // A ref to prevent re-opening dialog during transitions
  const isTransitioning = useRef(false);
  
  const timerRef = useRef(TIMER_DURATION);
  
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

  // Start game automatically when user logs in - with better control over multiple renders
  useEffect(() => {
    // Only run on first authentication with stricter conditions
    if (authenticated && !gameStarted && !showDialog && currentSet === 0 && !isTransitioning.current) {
      // Add a timeout to avoid render conflicts with other effects
      setTimeout(() => {
        prepareGame();
      }, 50);
    }
  }, [authenticated]); // Only depend on authentication changes

  // Update stats when score changes
  useEffect(() => {
    const updatePlayerStats = async () => {
      if (user?.wallet?.address && score > 0) {
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

  // Update game mode effect to handle initialization properly
  useEffect(() => {
    // Skip if transitioning between states to prevent re-renders
    if (isTransitioning.current) {
      return;
    }
    
    // Skip updates for currentSet >= total sets 
    if (currentSet >= ALL_WORD_PAIRS.length) {
      return;
    }
    
    const modeIndex = Math.floor(currentSet / 2) % GAME_MODES.length;
    const newMode = GAME_MODES[modeIndex];
    
    // Update mode state
    setCurrentGameMode(newMode);
    setTimeLeft(newMode.timeLimit);
    timerRef.current = newMode.timeLimit;
    
    // Reset combo state
    setComboCount(0);
    
    // IMPORTANT: Don't trigger dialog display directly from this effect
    // Dialog visibility is handled by moveToNextSet and prepareGame functions
    
    // Handle memory phase mode
    if (newMode.specialRules.memoryPhase) {
      setShowMemoryPhase(true);
      const timer = setTimeout(() => setShowMemoryPhase(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [currentSet]);  // Remove gameStarted dependency

  // Update timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    // Only run timer if game is started, time is greater than 0, and game over dialog is not showing
    if (gameStarted && timeLeft > 0 && !showGameOver) {
      // Initialize timerRef with the current timeLeft
      timerRef.current = timeLeft;
      
      timer = setInterval(() => {
        // Update ref first
        timerRef.current = Math.max(0, timerRef.current - 1);
        
        // Then update state (only if game is still running)
        if (gameStarted && !showGameOver) {
          setTimeLeft(timerRef.current);
          
          if (timerRef.current <= 0) {
            // Clear the timer immediately
            if (timer) clearInterval(timer);
            
            // Call handleTimeUp directly - not in setTimeout
            handleTimeUp();
          }
        }
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameStarted, showGameOver]);

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

  // Add a separate function to prepare the game without starting it
  const prepareGame = async () => {
    try {
      // Only initialize once
      if (currentSet === 0) {
        resetGame();
        initializeGame(0);
      }
      
      // Set initial game state, but don't start the timer yet
      setTimeLeft(currentGameMode.timeLimit);
      timerRef.current = currentGameMode.timeLimit;
      
      // Load initial stats
      if (user?.wallet?.address) {
        try {
          const response = await updateStats(0, currentGameMode);
          if (response) {
            setHighestScore(response.score);
          }
        } catch (error) {
          console.error('Error updating initial stats:', error);
        }
      }
      
      // Only after everything is ready, show the dialog
      isTransitioning.current = true;
      
      // Batch these state updates together
      setGameStarted(false);
      
      // Set dialog state with delay to avoid fast renders
      setTimeout(() => {
        isTransitioning.current = false;
        setShowDialog(true);
      }, 50);
    } catch (error) {
      console.error('Error preparing game:', error);
      isTransitioning.current = false;
      showMessage('Failed to prepare game. Please try again.', 'error');
    }
  };

  // Define a dedicated dialog close handler
  const handleDialogStart = useCallback(() => {
    // Set the transition flag to prevent re-opening
    isTransitioning.current = true;
    
    // First hide the dialog
    setShowDialog(false);
    
    // Then start the game with a delay
    setTimeout(() => {
      // Clear states
      setSelectedCards([]);
      setMatchedPairs(0);
      setComboCount(0);
      
      // Initialize game
      initializeGame(currentSet);
      setGameStarted(true);
      setTimeLeft(currentGameMode.timeLimit);
      
      // Reset transition flag
      isTransitioning.current = false;
    }, 100);
  }, [currentGameMode.timeLimit, currentSet, initializeGame]);

  // Update handleTimeUp to show game over dialog
  const handleTimeUp = () => {
    // Set transition flag to prevent unwanted renders
    isTransitioning.current = true;
    
    // Set processing flag to prevent any further actions 
    setIsProcessing(true);
    
    // Force timeLeft to 0 to prevent continued countdown
    setTimeLeft(0);
    
    // Stop the game first
    setGameStarted(false);
    
    // Submit final stats before showing game over
    if (user?.wallet?.address) {
      updateStats(score, currentGameMode)
        .catch(error => {
          console.error('Error updating final stats:', error);
        })
        .finally(() => {
          // Show game over dialog after stats update attempt - with longer delay to ensure it shows
          setShowGameOver(true);
          setIsProcessing(false);
          
          // Reset transition flag after a delay
          setTimeout(() => {
            isTransitioning.current = false;
          }, 500);
        });
    } else {
      // If no user, just show game over
      setShowGameOver(true);
      setIsProcessing(false);
      
      // Reset transition flag after a delay
      setTimeout(() => {
        isTransitioning.current = false;
      }, 500);
    }
  };

  // Update moveToNextSet to properly handle transitions
  const moveToNextSet = async () => {
    const nextSetIndex = currentSet + 1;
    
    // Set transition flag immediately to prevent unwanted state updates
    isTransitioning.current = true;
    
    if (nextSetIndex < ALL_WORD_PAIRS.length) {
      try {
        // First update the current set index to prevent it from being reset
        setCurrentSet(nextSetIndex);
        
        // Show completion message
        showMessage("Set Complete!", 'success');
        
        // Clear game states
        setGameStarted(false);
        setSelectedCards([]);
        setMatchedPairs(0);
        setComboCount(0);
        setIsProcessing(false);
        
        // Initialize the next set immediately
        initializeGame(nextSetIndex);
        
        // Update stats in the background (non-blocking)
        if (user?.wallet?.address) {
          updateStats(score, currentGameMode)
            .catch(error => {
              console.error('Error updating stats, but continuing:', error);
            });
        }
        
        // SIMPLIFIED: Show dialog with a single, consistent approach
        setTimeout(() => {
          // Force dialog to be hidden first to ensure clean state
          setShowDialog(false);
          
          // Initialize the next set and prepare for the dialog
          const nextModeIndex = Math.floor(nextSetIndex / 2) % GAME_MODES.length;
          const nextMode = GAME_MODES[nextModeIndex];
          setCurrentGameMode(nextMode);
          setTimeLeft(nextMode.timeLimit);
          timerRef.current = nextMode.timeLimit;
          
          // After a brief delay, show the dialog
          setTimeout(() => {
            // Release transition flag just before showing dialog
            isTransitioning.current = false;
            setShowDialog(true);
          }, 100);
        }, 300);
      } catch (error) {
        console.error('Error moving to next set:', error);
        // Still release transition flag to prevent getting stuck
        isTransitioning.current = false;
      }
    } else {
      // Handle game completion
      setShowGameOver(true);
      setGameStarted(false);
      
      // Release transition flag after a delay
      setTimeout(() => {
        isTransitioning.current = false;
      }, 500);
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
    } else {
      newComboCount = 1;
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

  // Update function to handle game restart
  const handleRestartGame = () => {
    // Set transition flag to prevent unwanted renders during restart
    isTransitioning.current = true;
    
    // First hide the game over dialog
    setShowGameOver(false);
    
    // Reset all game states
    setScore(0);
    setCurrentSet(0);
    setMatchedPairs(0);
    setComboCount(0);
    setSelectedCards([]);
    
    // Reset and initialize game with a delay to ensure clean state
    setTimeout(() => {
      resetGame();
      initializeGame(0);
      
      // Reset timer
      setTimeLeft(GAME_MODES[0].timeLimit);
      timerRef.current = GAME_MODES[0].timeLimit;
      
      // Update game mode
      setCurrentGameMode(GAME_MODES[0]);
      
      // Call prepareGame to show the intro dialog instead of starting immediately
      setGameStarted(false);
      
      // Need a bit longer delay to ensure dialog shows properly
      setTimeout(() => {
        isTransitioning.current = false;
        setShowDialog(true);
      }, 300);
    }, 200);
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

  if (!authenticated) {
    return <WelcomeScreen onPlay={handlePlay} />;
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

        {/* Game Over Dialog - Only show when not transitioning */}
        {showGameOver && (
          <React.Fragment key={`game-over-dialog-${Date.now()}`}>
            <GameOverDialog />
          </React.Fragment>
        )}

        {/* Mode Introduction Dialog - completely isolated with props */}
        {showDialog && currentSet < ALL_WORD_PAIRS.length && (
          <React.Fragment key={`dialog-${currentSet}`}>
            <ModeIntroDialog 
              mode={currentGameMode}
              currentSet={currentSet}
              totalSets={ALL_WORD_PAIRS.length}
              onStart={handleDialogStart}
            />
          </React.Fragment>
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
