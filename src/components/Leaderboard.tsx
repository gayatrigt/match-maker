import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { usePlayerStats } from '../hooks/usePlayerStats';
import 'nes.css/css/nes.min.css';
import './Leaderboard.css';

interface LeaderboardEntry {
  wallet_address: string;
  score: number;
  xp: number;
}

const Leaderboard = () => {
  const { user } = usePrivy();
  const { getLeaderboard } = usePlayerStats();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard();
        if (data) {
          setEntries(data as LeaderboardEntry[]);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [getLeaderboard]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-content">
        <div className="nes-container is-rounded">
          <h2 className="leaderboard-title nes-text is-primary">Top Players</h2>

          {loading ? (
            <div className="loading-container">
              <span className="nes-text">Loading...</span>
            </div>
          ) : entries.length === 0 ? (
            <div className="empty-container">
              <span className="nes-text">No entries yet</span>
            </div>
          ) : (
            <table className="nes-table is-bordered is-centered">
              <thead>
                <tr>
                  <th className="rank-column">Rank</th>
                  <th className="player-column">Player</th>
                  <th className="score-column">Score</th>
                  <th className="xp-column">XP</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={entry.wallet_address}>
                    <td className="nes-text is-primary">{index + 1}</td>
                    <td className={entry.wallet_address === user?.wallet?.address ? 'nes-text is-success' : ''}>
                      {formatAddress(entry.wallet_address)}
                    </td>
                    <td className="nes-text is-primary">{entry.score}</td>
                    <td className="nes-text is-warning">{entry.xp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard; 