import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { usePrivy } from '@privy-io/react-auth';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface PlayerStats {
  score: number;
  xp: number;
  achievement_nft_minted: boolean;
}

export function usePlayerStats() {
  const { user } = usePrivy();
  const [stats, setStats] = useState<PlayerStats>({
    score: 0,
    xp: 0,
    achievement_nft_minted: false
  });

  // Calculate XP based on score and other factors
  const calculateXP = (score: number): number => {
    // Base XP is equal to score
    let xp = score;
    
    // Bonus XP for milestones
    if (score >= 100) xp += 1000; // Achievement NFT milestone
    if (score >= 50) xp += 500;   // Half-way milestone
    if (score >= 25) xp += 250;   // Quarter-way milestone
    
    return xp;
  };

  // Update player stats
  const updateStats = useCallback(async (newScore: number, xpIncrease: number = 0) => {
    if (!user?.wallet?.address) {
      console.log('No wallet address found');
      return;
    }

    try {
      console.log('Starting updateStats with:', { 
        walletAddress: user.wallet.address,
        newScore, 
        xpIncrease,
        currentStats: stats
      });

      // First get current stats to ensure we keep the highest score
      const { data: currentStats, error: fetchError } = await supabase
        .from('leaderboard')
        .select('score, xp')
        .eq('wallet_address', user.wallet.address)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.log('Error fetching current stats:', fetchError.message, fetchError.details);
        return;
      }

      // Calculate the final values
      const finalScore = Math.max(currentStats?.score || 0, newScore);
      const finalXP = (currentStats?.xp || 0) + xpIncrease;

      console.log('Calculated final values:', { finalScore, finalXP });

      // Upsert the record with ON CONFLICT DO UPDATE
      const { data: upsertResponse, error: upsertError } = await supabase
        .from('leaderboard')
        .upsert(
          {
            wallet_address: user.wallet.address,
            score: finalScore,
            xp: finalXP,
            updated_at: new Date().toISOString()
          },
          {
            onConflict: 'wallet_address',
            ignoreDuplicates: false
          }
        )
        .select()
        .single();

      if (upsertError) {
        console.error('Error upserting stats:', upsertError.message, upsertError.details);
        return;
      }

      console.log('Upsert successful. Response:', upsertResponse);

      // Update local state with the new values
      setStats(prev => ({
        ...prev,
        score: finalScore,
        xp: finalXP
      }));

      return {
        score: finalScore,
        xp: finalXP
      };

    } catch (error) {
      console.error('Error in updateStats:', error);
    }
  }, [user?.wallet?.address, stats]);

  // Mark NFT as minted
  const markNFTMinted = useCallback(async () => {
    if (!user?.wallet?.address) return;

    const { error } = await supabase
      .from('leaderboard')
      .update({ achievement_nft_minted: true })
      .eq('wallet_address', user.wallet.address);

    if (error) {
      console.error('Error marking NFT as minted:', error);
      return;
    }

    setStats(prev => ({
      ...prev,
      achievement_nft_minted: true
    }));
  }, [user?.wallet?.address]);

  // Load initial stats
  useEffect(() => {
    const loadStats = async () => {
      if (!user?.wallet?.address) return;

      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('wallet_address', user.wallet.address)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error loading stats:', error);
        return;
      }

      if (data) {
        setStats({
          score: data.score,
          xp: data.xp,
          achievement_nft_minted: data.achievement_nft_minted
        });
      }
    };

    loadStats();
  }, [user?.wallet?.address]);

  return {
    stats,
    updateStats,
    markNFTMinted
  };
} 