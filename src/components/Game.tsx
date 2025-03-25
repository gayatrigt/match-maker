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
  const { updateStats, stats } = usePlayerStats();
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

  const getCardColor = (card: Card) => {
    if (card.isMatched) return 'green.100';
    if (card.isIncorrect) return 'red.100';
    if (card.isSelected) return 'blue.50';
    return 'white';
  };

  const getCardAnimation = (card: Card) => {
    if (card.isMatched || card.isIncorrect) {
      return `${pulseAnimation} 0.5s ease-in-out`;
    }
    return 'none';
  };

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
        console.log('Updating stats');
        try {
          const response = await updateStats(Math.max(newScore, highestScore));
          
          if (response) {
            setHighestScore(Math.max(response.score, highestScore));
            toast({
              title: "Set Complete!",
              description: `Moving to Set ${nextSetIndex + 1}`,
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
      
      setCurrentSet(nextSetIndex);
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

  return (
    <Box minH="100vh" bg="#FF8B8B">
      <Container maxW="container.md" py={{ base: 16, md: 20 }} px={{ base: 4, md: 6 }}>
        <VStack spacing={6}>
          {/* Top bar */}
          <HStack w="full" justify="space-between" color="white">
            <VStack spacing={2} w="full" px={{ base: 2, md: 6 }}>
              <Progress
                value={(matchedPairs / 5) * 100}
                size="md"
                colorScheme="whiteAlpha"
                bg="whiteAlpha.300"
                borderRadius="full"
                w="full"
              />
              <HStack spacing={4} justify="center" fontSize={{ base: "sm", md: "lg" }}>
                <Text color="white" fontWeight="bold">
                  Score: {score}
                </Text>
                <Text color="white" fontWeight="bold">
                  Best: {highestScore}
                </Text>
                <Text color="white" fontWeight="bold">
                  XP: {stats?.xp || 0}
                </Text>
              </HStack>
            </VStack>
          </HStack>

          {/* Instructions */}
          <Text
            color="white"
            fontSize={{ base: "lg", md: "2xl" }}
            fontWeight="semibold"
            textAlign="center"
            mb={4}
          >
            Match the Web3 terms with their definitions
          </Text>

          {/* Game grid */}
          <SimpleGrid
            columns={2}
            spacing={{ base: 4, md: 8 }}
            w="full"
            px={{ base: 0, md: 2 }}
          >
            {/* Terms Column */}
            <VStack spacing={{ base: 2, md: 3 }} align="stretch">
              {cards.filter(card => card.type === 'term').map((card) => (
                <Button
                  key={card.id}
                  w="full"
                  h={{ base: "80px", md: "100px" }}
                  bg={getCardColor(card)}
                  color="gray.700"
                  fontSize={{ base: "sm", md: "lg" }}
                  fontWeight="normal"
                  borderRadius="2xl"
                  _hover={{ bg: getCardColor(card) }}
                  _active={{ bg: getCardColor(card) }}
                  boxShadow="none"
                  onClick={() => handleCardClick(cards.indexOf(card))}
                  disabled={card.isMatched || !gameStarted}
                  p={{ base: 2, md: 4 }}
                  whiteSpace="normal"
                  textAlign="center"
                  border="none"
                  transition="all 0.2s"
                  animation={getCardAnimation(card)}
                >
                  {card.text}
                </Button>
              ))}
            </VStack>

            {/* Definitions Column */}
            <VStack spacing={{ base: 2, md: 3 }} align="stretch">
              {cards.filter(card => card.type === 'definition').map((card) => (
                <Button
                  key={card.id}
                  w="full"
                  h={{ base: "80px", md: "100px" }}
                  bg={getCardColor(card)}
                  color="gray.700"
                  fontSize={{ base: "xs", md: "md" }}
                  fontWeight="normal"
                  borderRadius="2xl"
                  _hover={{ bg: getCardColor(card) }}
                  _active={{ bg: getCardColor(card) }}
                  boxShadow="none"
                  onClick={() => handleCardClick(cards.indexOf(card))}
                  disabled={card.isMatched || !gameStarted}
                  p={{ base: 2, md: 4 }}
                  whiteSpace="normal"
                  textAlign="center"
                  border="none"
                  transition="all 0.2s"
                  animation={getCardAnimation(card)}
                >
                  {card.text}
                </Button>
              ))}
            </VStack>
          </SimpleGrid>

          {/* Start button */}
          {!gameStarted && (
            <Button
              position="fixed"
              bottom={8}
              left="50%"
              transform="translateX(-50%)"
              bg="white"
              color="gray.700"
              size={{ base: "md", md: "lg" }}
              fontSize={{ base: "lg", md: "xl" }}
              py={{ base: 5, md: 7 }}
              px={{ base: 8, md: 12 }}
              borderRadius="2xl"
              onClick={startGame}
            >
              Start Game
            </Button>
          )}

          {/* Error Dialog */}
          {showSaveScore && (
            <Box
              position="fixed"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              bg="white"
              p={{ base: 4, md: 6 }}
              borderRadius="xl"
              boxShadow="xl"
              zIndex={10}
              textAlign="center"
              mx={4}
              maxW="90vw"
            >
              <VStack spacing={4}>
                <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color="gray.700">
                  Wrong Match!
                </Text>
                <VStack spacing={2}>
                  <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>
                    The correct match was:
                  </Text>
                  <Text color="blue.600" fontWeight="semibold" fontSize={{ base: "sm", md: "md" }}>
                    {cards[selectedCards[0]]?.text} → {correctAnswer}
                  </Text>
                </VStack>
                <Button
                  colorScheme="blue"
                  onClick={() => {
                    setScore(0);
                    setMatchedPairs(0);
                    initializeGame(currentSet);
                    setShowSaveScore(false);
                  }}
                  size={{ base: "sm", md: "md" }}
                >
                  Restart Set
                </Button>
              </VStack>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default Game; 