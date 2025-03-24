import { useCallback } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';

const NFT_CONTRACT_ADDRESS = import.meta.env.VITE_NFT_CONTRACT_ADDRESS;

const NFT_ABI = [
  "function claimAchievement() external",
  "function hasClaimed(address) external view returns (bool)",
  "function verifiedScores(address) external view returns (uint256)"
];

export function useNFTContract() {
  const { user } = usePrivy();
  const { wallets } = useWallets();

  const claimNFT = useCallback(async () => {
    if (!user?.wallet?.address || !wallets?.[0]) {
      throw new Error('Wallet not connected');
    }

    try {
      const provider = await wallets[0].getEthersProvider();
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer);

      const tx = await contract.claimAchievement();
      await tx.wait();

      return true;
    } catch (error) {
      console.error('Error claiming NFT:', error);
      throw error;
    }
  }, [user?.wallet?.address, wallets]);

  const checkEligibility = useCallback(async () => {
    if (!user?.wallet?.address || !wallets?.[0]) {
      return { hasClaimed: false, verifiedScore: 0 };
    }

    try {
      const provider = await wallets[0].getEthersProvider();
      const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);

      const [claimed, score] = await Promise.all([
        contract.hasClaimed(user.wallet.address),
        contract.verifiedScores(user.wallet.address)
      ]);

      return {
        hasClaimed: claimed,
        verifiedScore: score.toNumber()
      };
    } catch (error) {
      console.error('Error checking eligibility:', error);
      return { hasClaimed: false, verifiedScore: 0 };
    }
  }, [user?.wallet?.address, wallets]);

  return {
    claimNFT,
    checkEligibility
  };
} 