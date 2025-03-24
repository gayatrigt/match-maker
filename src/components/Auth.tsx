import { Button } from '@chakra-ui/react';
import { usePrivy } from '@privy-io/react-auth';

const Auth = () => {
  const { login, authenticated, logout } = usePrivy();

  return (
    <Button
      onClick={authenticated ? logout : login}
      colorScheme={authenticated ? "red" : "blue"}
      variant={authenticated ? "ghost" : "solid"}
    >
      {authenticated ? "Logout" : "Connect Wallet"}
    </Button>
  );
};

export default Auth; 