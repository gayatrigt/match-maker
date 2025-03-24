import React, { useEffect, useState } from 'react';
import { Text, HStack, Spinner } from '@chakra-ui/react';
import { usePrivy } from '@privy-io/react-auth';

interface UserIdentity {
  ens?: string;
  farcaster?: string;
}

export const UserProfile: React.FC = () => {
  const { user, authenticated } = usePrivy();
  const [identities, setIdentities] = useState<UserIdentity>({});
  const [loading, setLoading] = useState(true);

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
        console.log('Farcaster account:', farcasterAccount);

        // Check for ENS in email
        const emailAccount = user.linkedAccounts?.find(account => {
          if (account.type === 'email') {
            const emailData = account as { email?: string };
            return emailData.email && emailData.email.endsWith('.eth');
          }
          return false;
        });
        console.log('Email account with ENS:', emailAccount);

        setIdentities({
          farcaster: farcasterAccount ? (farcasterAccount as { username: string }).username : undefined,
          ens: emailAccount ? (emailAccount as { email: string }).email : undefined
        });
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

  return (
    <HStack spacing={4} align="center">
      {loading ? (
        <Spinner size="sm" />
      ) : (
        <Text fontSize="sm" color="gray.600">
          {identities.farcaster || identities.ens || displayAddress}
        </Text>
      )}
    </HStack>
  );
}; 