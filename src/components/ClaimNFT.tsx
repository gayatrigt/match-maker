import { Button, Text, VStack, useToast } from '@chakra-ui/react';
import { usePrivy } from '@privy-io/react-auth';
import { useGame } from '../context/GameContext';
import { usePlayerStats } from '../hooks/usePlayerStats';

export const ClaimNFT = () => {
  const { user } = usePrivy();
  const { score } = useGame();
  const { markNFTMinted } = usePlayerStats();
  const toast = useToast();

  const handleClaim = async () => {
    if (!user?.wallet?.address) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Mark NFT as minted in the database
      await markNFTMinted();
      
      toast({
        title: "Success!",
        description: "NFT claimed successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error claiming NFT:', error);
      toast({
        title: "Error",
        description: "Failed to claim NFT. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (score < 100) {
    return null;
  }

  return (
    <VStack spacing={4} bg="white" p={6} borderRadius="xl" boxShadow="lg">
      <Text fontSize="xl" fontWeight="bold" color="gray.800">
        🎉 Congratulations!
      </Text>
      <Text textAlign="center" color="gray.600">
        You've reached 100 points! Claim your NFT achievement.
      </Text>
      <Button
        colorScheme="purple"
        size="lg"
        onClick={handleClaim}
      >
        Claim NFT
      </Button>
    </VStack>
  );
}; 