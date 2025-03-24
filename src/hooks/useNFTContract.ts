import { useCallback } from 'react';
import { ethers } from 'ethers';
import AchievementNFT from '../contracts/AchievementNFT.json';
import { usePrivy } from '@privy-io/react-auth';

export const useNFTContract = () => {
  const { user } = usePrivy();
  const contractAddress = import.meta.env.VITE_NFT_CONTRACT_ADDRESS;

  const getContract = useCallback(async () => {
    if (!user?.wallet?.address) {
      throw new Error('No wallet connected');
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return new ethers.Contract(
        contractAddress,
        AchievementNFT.abi,
        signer
      );
    } catch (error) {
      console.error('Error getting contract:', error);
      throw error;
    }
  }, [user?.wallet?.address]);

  const claimNFT = useCallback(async () => {
    try {
      const contract = await getContract();
      const tx = await contract.mint();
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
    }
  }, [getContract]);

  const checkEligibility = useCallback(async () => {
    try {
      const contract = await getContract();
      const hasClaimed = await contract.hasClaimed(user?.wallet?.address);
      const verifiedScore = await contract.getVerifiedScore(user?.wallet?.address);
      return {
        hasClaimed,
        verifiedScore: verifiedScore.toNumber()
      };
    } catch (error) {
      console.error('Error checking eligibility:', error);
      throw error;
    }
  }, [getContract, user?.wallet?.address]);

  return {
    claimNFT,
    checkEligibility
  };
}; 