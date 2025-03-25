import { PrivyProvider } from '@privy-io/react-auth';
import { GameProvider } from './context/GameContext';

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID}
      config={{
        loginMethods: ['wallet', 'email'],
        appearance: {
          theme: 'light',
          accentColor: '#676767',
          showWalletLoginFirst: true,
        },
      }}
    >
      <GameProvider>
        {children}
      </GameProvider>
    </PrivyProvider>
  );
};

export default Providers; 