/// <reference types="vite/client" />

import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PrivyProvider } from '@privy-io/react-auth';
import Game from './components/Game';
import Navbar from './components/Navbar';
import Leaderboard from './components/Leaderboard';
import { GameProvider } from './context/GameContext';

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: '#FF8B8B',
      },
    },
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <PrivyProvider
        appId={import.meta.env.VITE_PRIVY_APP_ID}
        config={{
          loginMethods: ['wallet', 'farcaster', 'email'],
          defaultChain: {
            id: 8453,  // Base Mainnet
            name: 'Base',
            network: 'base',
            rpcUrls: {
              default: {
                http: ['https://mainnet.base.org']
              }
            },
            nativeCurrency: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18
            }
          },
          appearance: {
            theme: 'light',
            accentColor: '#FF8B8B',
          },
        }}
      >
        <GameProvider>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<Game />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Routes>
          </Router>
        </GameProvider>
      </PrivyProvider>
    </ChakraProvider>
  );
}

export default App; 