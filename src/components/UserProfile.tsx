import React, { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useEnsName } from 'wagmi';
import 'nes.css/css/nes.min.css';
import './UserProfile.css';

interface UserIdentity {
  ens?: string;
  farcaster?: string;
}

export const UserProfile: React.FC = () => {
  const { user, authenticated } = usePrivy();
  const [loading, setLoading] = useState(true);
  const [farcasterUsername, setFarcasterUsername] = useState<string | undefined>();
  
  // Get ENS name from wallet address
  const { data: ensName } = useEnsName({ 
    address: user?.wallet?.address as `0x${string}` | undefined,
    chainId: 1 // Mainnet
  });

  useEffect(() => {
    const fetchIdentities = async () => {
      if (!authenticated || !user) {
        setLoading(false);
        return;
      }

      try {
        console.log('Full user object:', user);
        
        // Check for Farcaster
        const farcasterAccount = user.linkedAccounts?.find(account => {
          if (account.type === 'farcaster') {
            const farcasterData = account as { username?: string };
            return 'username' in farcasterData;
          }
          return false;
        });
        
        if (farcasterAccount) {
          setFarcasterUsername((farcasterAccount as { username: string }).username);
        }
        
        console.log('Farcaster account:', farcasterAccount);
      } catch (error) {
        console.error('Error fetching identities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIdentities();
  }, [authenticated, user]);

  if (!authenticated) {
    return null;
  }

  const displayAddress = user?.wallet?.address ? 
    `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : 
    '';

  // Display priority: Farcaster > ENS > Wallet Address
  const displayName = farcasterUsername ? 
    `@${farcasterUsername}` : 
    ensName || displayAddress;

  return (
    <div className="user-profile">
      {loading ? (
        <div className="loading-spinner" />
      ) : (
        <span className="nes-text">
          {displayName}
        </span>
      )}
    </div>
  );
}; 