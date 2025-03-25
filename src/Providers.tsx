import { GameProvider } from './context/GameContext';

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <GameProvider>
      {children}
    </GameProvider>
  );
};

export default Providers; 