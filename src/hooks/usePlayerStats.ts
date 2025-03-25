import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { usePrivy } from '@privy-io/react-auth';
import { useEnsName } from 'wagmi';

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
}

export function usePlayerStats() {
  const { user } = usePrivy();
  const { data: ensName } = useEnsName({ 
    address: user?.wallet?.address as `0x${string}` | undefined,
    chainId: 1 // Mainnet
  });
  const [stats, setStats] = useState<PlayerStats>({
    score: 0,
    xp: 0
  });

  // Calculate XP based on score (1 set = 1 XP)
  const calculateXP = (score: number): number => {
    // Each completed set (5 matches) equals 1 XP
    const completedSets = Math.floor(score / 5);
    return completedSets;
  };

  // Update player stats
  const updateStats = useCallback(async (newScore: number) => {
    console.log('🎯 updateStats called with newScore:', newScore);
    
    if (!user?.wallet?.address) {
      console.log('❌ No wallet address found');
      return;
    }

    try {
      // Get user's email if they logged in with email
      const emailAccount = user.linkedAccounts?.find(account => account.type === 'email') as { email?: string } | undefined;
      const userEmail = emailAccount?.email;

      // Get Farcaster username if available
      const farcasterAccount = user.linkedAccounts?.find(account => {
        if (account.type === 'farcaster') {
          const farcasterData = account as { username?: string };
          return 'username' in farcasterData;
        }
        return false;
      }) as { username?: string } | undefined;
      const farcasterUsername = farcasterAccount?.username;

      console.log('👤 User details:', { 
        walletAddress: user.wallet.address,
        email: userEmail,
        farcasterUsername,
        ensName,
        newScore,
        currentStats: stats
      });

      // First get current stats to ensure we keep the highest score
      const { data: currentStats, error: fetchError } = await supabase
        .from('leaderboard')
        .select('score, xp')
        .eq('wallet_address', user.wallet.address)
        .single();

      console.log('📊 Current stats from DB:', currentStats, 'Error:', fetchError);

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.log('❌ Error fetching current stats:', fetchError.message, fetchError.details);
        return;
      }

      // Calculate the final values
      const finalScore = Math.max(currentStats?.score || 0, newScore);
      const finalXP = calculateXP(finalScore);

      console.log('🎮 Calculated values:', { 
        finalScore, 
        finalXP,
        currentScore: currentStats?.score || 0,
        currentXP: currentStats?.xp || 0
      });

      // Upsert the record with ON CONFLICT DO UPDATE
      const { data: upsertResponse, error: upsertError } = await supabase
        .from('leaderboard')
        .upsert(
          {
            wallet_address: user.wallet.address,
            email: userEmail,
            ens_name: ensName,
            farcaster_username: farcasterUsername,
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
        console.error('❌ Error upserting stats:', upsertError.message, upsertError.details);
        return;
      }

      console.log('✅ Upsert successful. Response:', upsertResponse);

      // Update local state with the new values
      setStats(prev => {
        const newStats = {
          ...prev,
          score: finalScore,
          xp: finalXP
        };
        console.log('🔄 Updating local stats:', { prev, new: newStats });
        return newStats;
      });

      return {
        score: finalScore,
        xp: finalXP
      };

    } catch (error) {
      console.error('❌ Error in updateStats:', error);
    }
  }, [user?.wallet?.address, stats, calculateXP, ensName]);

  // Load initial stats
  useEffect(() => {
    const loadStats = async () => {
      if (!user?.wallet?.address) return;

      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('wallet_address', user.wallet.address)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading stats:', error);
        return;
      }

      if (data) {
        setStats({
          score: data.score,
          xp: data.xp
        });
      }
    };

    loadStats();
  }, [user?.wallet?.address]);

  // Get leaderboard data
  const getLeaderboard = useCallback(async () => {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('wallet_address, email, ens_name, farcaster_username, score, xp')
      .order('score', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return null;
    }

    return data;
  }, []);

  return {
    stats,
    updateStats,
    getLeaderboard
  };
} 