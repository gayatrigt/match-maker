import { Box, HStack, Button, Container, Flex, Link as ChakraLink, Hide } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { UserProfile } from './UserProfile';

const Navbar = () => {
  const { login, authenticated, logout } = usePrivy();

  return (
    <Box as="nav" bg="white" boxShadow="sm" position="fixed" width="100%" top={0} zIndex={10}>
      <Container maxW="container.xl" py={4}>
        <Flex justify="space-between" align="center">
          {/* Left - Leaderboard Link */}
          <Box flex="1">
            <ChakraLink
              as={RouterLink}
              to="/leaderboard"
              fontSize={{ base: "sm", md: "md" }}
              color="gray.600"
              _hover={{ textDecoration: "none", color: "blue.500" }}
            >
              Leaderboard
            </ChakraLink>
          </Box>

          {/* Center - Logo */}
          <ChakraLink
            as={RouterLink}
            to="/"
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight="bold"
            color="gray.800"
            _hover={{ textDecoration: "none", color: "blue.500" }}
            position="absolute"
            left="50%"
            transform="translateX(-50%)"
            whiteSpace="nowrap"
          >
            Game
          </ChakraLink>

          {/* Right - Auth */}
          <HStack spacing={4} justify="flex-end" flex="1">
            {authenticated ? (
              <>
                <Hide below="md">
                  <UserProfile />
                </Hide>
                <Button
                  onClick={() => logout()}
                  size={{ base: "sm", md: "md" }}
                  colorScheme="red"
                  variant="ghost"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={() => login()}
                size={{ base: "sm", md: "md" }}
                colorScheme="blue"
              >
                Connect Wallet
              </Button>
            )}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Navbar; 