import { Box, Container, VStack, Text, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface LeaderboardEntry {
  wallet_address: string;
  score: number;
  xp: number;
}

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from('leaderboard')
          .select('*')
          .order('score', { ascending: false })
          .limit(10);

        if (error) throw error;
        setLeaderboard(data || []);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <Box
      minH="100vh"
      pt={20}
      bgImage="url('/path-to-your-image.jpg')"
      bgSize="cover"
      bgPosition="center"
      bgRepeat="no-repeat"
      position="relative"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        bg: "rgba(255, 139, 139, 0.85)", // Similar to your current pink but with opacity
        zIndex: 0
      }}
    >
      <Container maxW="container.lg" py={8} position="relative" zIndex={1}>
        <VStack spacing={8}>
          <Text
            fontSize={{ base: "2xl", md: "4xl" }}
            fontWeight="bold"
            color="white"
            textAlign="center"
          >
            Top Players
          </Text>

          <Box
            bg="white"
            borderRadius="xl"
            boxShadow="lg"
            w="full"
            overflow="hidden"
          >
            <Table variant="simple" size={{ base: "sm", md: "md" }}>
              <Thead>
                <Tr>
                  <Th>Rank</Th>
                  <Th>Player</Th>
                  <Th isNumeric>Score</Th>
                  <Th isNumeric>XP</Th>
                </Tr>
              </Thead>
              <Tbody>
                {leaderboard.map((entry, index) => (
                  <Tr key={entry.wallet_address}>
                    <Td fontWeight="bold">{index + 1}</Td>
                    <Td>
                      {`${entry.wallet_address.slice(0, 6)}...${entry.wallet_address.slice(-4)}`}
                    </Td>
                    <Td isNumeric>{entry.score}</Td>
                    <Td isNumeric>{entry.xp}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default Leaderboard; 