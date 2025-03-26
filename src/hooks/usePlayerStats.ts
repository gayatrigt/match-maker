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

  // Calculate XP based on score and game mode
  const calculateXP = (score: number, gameMode: any): number => {
    // Base XP for completing a set
    let baseXP = 1;
    
    // Additional XP based on game mode multiplier
    const modeMultiplier = gameMode?.xpMultiplier || 1;
    const modeXP = baseXP * modeMultiplier;
    
    // Additional XP for special achievements in the mode
    let bonusXP = 0;
    if (gameMode?.specialRules?.chainCombo && score > 5) {
      bonusXP += 1; // Bonus for chain combos
    }
    if (gameMode?.specialRules?.memoryPhase) {
      bonusXP += 1; // Bonus for memory phase completion
    }
    if (gameMode?.specialRules?.speedRound && score > 0) {
      bonusXP += 1; // Bonus for speed rounds
    }
    
    return Math.floor(modeXP + bonusXP);
  };

  // Update player stats
  const updateStats = useCallback(async (newScore: number, gameMode: any = null) => {
    console.log('🎯 updateStats called with newScore:', newScore, 'gameMode:', gameMode);
    
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
        gameMode,
        currentStats: stats
      });

      // First get current stats
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

      // Calculate XP gain for this session
      const xpGain = calculateXP(newScore, gameMode);
      
      // Calculate final values
      // Score is still highest score achieved
      const finalScore = Math.max(currentStats?.score || 0, newScore);
      // XP accumulates across sessions
      const finalXP = (currentStats?.xp || 0) + xpGain;

      console.log('🎮 Calculated values:', { 
        finalScore, 
        finalXP,
        currentScore: currentStats?.score || 0,
        currentXP: currentStats?.xp || 0,
        xpGain
      });

      // Upsert the record with ON CONFLICT DO UPDATE
      const { data: upsertResponse, error: upsertError } = await supabase
        .from('leaderboard')
        .upsert(
          {
            wallet_address: user.wallet.address,
            email: userEmail,
            farcaster_username: farcasterUsername,
            ens_name: ensName,
            score: finalScore,
            xp: finalXP,
            updated_at: new Date().toISOString()
          },
          {
            onConflict: 'wallet_address'
          }
        );

      if (upsertError) {
        console.error('❌ Error upserting stats:', upsertError);
        return;
      }

      console.log('✅ Stats updated successfully:', upsertResponse);
      setStats({ score: finalScore, xp: finalXP });
      return { score: finalScore, xp: finalXP };
    } catch (error) {
      console.error('❌ Error in updateStats:', error);
      return;
    }
  }, [user, ensName, stats]);

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