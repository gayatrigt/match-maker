import { useEffect, useState } from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  Button,
  useToast,
  Container,
  VStack,
  HStack,
  Progress,
  keyframes,
} from '@chakra-ui/react';
import { useGame } from '../context/GameContext';
import { usePrivy } from '@privy-io/react-auth';
import { usePlayerStats } from '../hooks/usePlayerStats';
import { ALL_WORD_PAIRS } from '../data/wordPairs';

interface Card {
  id: number;
  text: string;
  type: 'term' | 'definition';
  isMatched: boolean;
  isSelected: boolean;
  isIncorrect: boolean;
}

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const Game = () => {
  const { user } = usePrivy();
  const { stats, updateStats } = usePlayerStats();
  const toast = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSaveScore, setShowSaveScore] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [highestScore, setHighestScore] = useState(0);

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
      toast({
        title: 'Error',
        description: 'Failed to start game. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
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
        console.log('Updating stats with XP increase');
        try {
          const response = await updateStats(Math.max(newScore, highestScore));
          
          if (response) {
            setHighestScore(Math.max(response.score, highestScore));
            toast({
              title: "Set Complete!",
              description: `Set completed! Moving to Set ${nextSetIndex + 1}`,
              status: "success",
              duration: 2000,
              isClosable: true,
            });
          }
        } catch (error) {
          console.error('Error updating stats:', error);
        }
      } else {
        console.log('No wallet address found when completing set');
        toast({
          title: "Set Complete!",
          description: `Moving to Set ${nextSetIndex + 1}`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      }
      
      // First update the current set
      setCurrentSet(nextSetIndex);
      // Then initialize the game with the new set
      setTimeout(() => {
        console.log('Initializing game for set:', nextSetIndex);
        setMatchedPairs(0);
        initializeGame(nextSetIndex);
      }, 100);
      
    } else {
      toast({
        title: "Game Complete!",
        description: "You've completed all sets!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle card click
  const handleCardClick = (cardId: number) => {
    if (!gameStarted) return;
    if (isProcessing) return;
    if (cards[cardId].isMatched) return;
    if (selectedCards.includes(cardId)) return;
    if (showSaveScore) return;

    const updatedCards = [...cards];
    updatedCards[cardId].isSelected = true;
    setCards(updatedCards);
    setSelectedCards([...selectedCards, cardId]);

    if (selectedCards.length === 1) {
      setIsProcessing(true);
      const firstCard = cards[selectedCards[0]];
      const secondCard = cards[cardId];

      if (firstCard.text === secondCard.text) {
        setTimeout(() => {
          const resetCards = [...updatedCards];
          resetCards[selectedCards[0]].isSelected = false;
          resetCards[cardId].isSelected = false;
          setCards(resetCards);
          setSelectedCards([]);
          setIsProcessing(false);
        }, 300);
        return;
      }

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

        // Clear any existing error state first
        setShowSaveScore(false);
        setCorrectAnswer('');
        
        // Small delay to ensure clean state before showing new error
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

  const getCardColor = (card: Card) => {
    if (card.isMatched) return 'green.100';
    if (card.isIncorrect) return 'red.100';
    if (card.isSelected) return 'blue.50';
    return 'white';
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        {!gameStarted ? (
          <VStack spacing={4}>
            <Text fontSize="2xl" fontWeight="bold">
              Memory Game
            </Text>
            <Button colorScheme="blue" onClick={startGame}>
              Start Game
            </Button>
          </VStack>
        ) : (
          <>
            <HStack justify="space-between">
              <Text>Set: {currentSet + 1}</Text>
              <Text>Score: {score}</Text>
              {user?.wallet?.address && (
                <Text>High Score: {highestScore}</Text>
              )}
            </HStack>
            <Progress value={(matchedPairs / 5) * 100} colorScheme="green" />
            <SimpleGrid columns={5} spacing={4}>
              {cards.map((card) => (
                <Box
                  key={card.id}
                  p={4}
                  bg={getCardColor(card)}
                  borderRadius="md"
                  cursor={card.isMatched ? 'default' : 'pointer'}
                  onClick={() => handleCardClick(card.id)}
                  textAlign="center"
                  height="100px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  transition="all 0.2s"
                  animation={
                    card.isSelected
                      ? `${pulseAnimation} 0.5s ease-in-out`
                      : undefined
                  }
                  _hover={
                    !card.isMatched && !isProcessing
                      ? { transform: 'scale(1.05)' }
                      : undefined
                  }
                >
                  <Text>{card.isSelected || card.isMatched ? card.text : '?'}</Text>
                </Box>
              ))}
            </SimpleGrid>
            {showSaveScore && correctAnswer && (
              <Box textAlign="center" color="red.500">
                <Text>Incorrect match! The correct match was: {correctAnswer}</Text>
              </Box>
            )}
          </>
        )}
      </VStack>
    </Container>
  );
};

export default Game; 