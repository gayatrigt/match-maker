import { usePlayerStats } from '../hooks/usePlayerStats';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'nes.css/css/nes.min.css';
import './Airdrop.css';

const Airdrop = () => {
  const { getLeaderboard } = usePlayerStats();
  const [qualifiedUsers, setQualifiedUsers] = useState(0);
  const TARGET_USERS = 420;

  useEffect(() => {
    const fetchQualifiedUsers = async () => {
      const leaderboard = await getLeaderboard();
      if (leaderboard) {
        const qualified = leaderboard.filter(user => user.score >= 100).length;
        setQualifiedUsers(qualified);
      }
    };

    fetchQualifiedUsers();
    // Refresh every 30 seconds
    const interval = setInterval(fetchQualifiedUsers, 30000);
    return () => clearInterval(interval);
  }, [getLeaderboard]);

  const progressPercentage = (qualifiedUsers / TARGET_USERS) * 100;

  return (
    <div className="airdrop-container">
      <div className="airdrop-content">
        <div className="nes-container is-rounded with-title">
          <p className="title">Token Launch</p>
          
          <div className="bento-grid">
            {/* Main Title Card */}
            <div className="bento-card title-card">
              <h1 className="nes-text is-primary">Crypto Match Token (CMT)</h1>
              <div className="progress-info">
                <span>{qualifiedUsers} / {TARGET_USERS} Players Qualified</span>
                <progress 
                  className="nes-progress is-success" 
                  value={progressPercentage} 
                  max="100"
                />
              </div>
            </div>

            {/* Play-to-Learn Card */}
            <div className="bento-card info-card">
              <h3 className="nes-text">🎮 Play-to-Learn Revolution</h3>
              <p>
                Crypto Match is pioneering the Play-to-Learn movement in Web3. 
                We believe learning about blockchain technology should be fun, 
                engaging, and rewarding.
              </p>
            </div>

            {/* Qualification Steps Card */}
            <div className="bento-card steps-card">
              <h3 className="nes-text">🎯 How to Qualify</h3>
              <div className="qualification-steps">
                <div className="step">
                  <span className="step-number">1</span>
                  <p><Link to="/play" className="nes-text is-primary">Play the game</Link></p>
                </div>
                <div className="step">
                  <span className="step-number">2</span>
                  <p>Score 100+ points</p>
                </div>
                <div className="step">
                  <span className="step-number">3</span>
                  <p>Earn weekly rewards</p>
                </div>
              </div>
            </div>

            {/* Token Distribution Card */}
            <div className="bento-card token-card">
              <h3 className="nes-text">🪙 Token Distribution</h3>
              <div className="token-grid">
                <div className="token-detail">
                  <span className="detail-label">Initial Airdrop</span>
                  <span className="detail-value">42.0% of Supply</span>
                </div>
                <div className="token-detail">
                  <span className="detail-label">Recipients</span>
                  <span className="detail-value">First 420 Players</span>
                </div>
                <div className="token-detail">
                  <span className="detail-label">Weekly Rewards</span>
                  <span className="detail-value">50% of LP Fees</span>
                </div>
                <div className="token-detail">
                  <span className="detail-label">Chain</span>
                  <span className="detail-value">Base</span>
                </div>
              </div>
            </div>

            {/* Reward Mechanics Card */}
            <div className="bento-card rewards-card">
              <h3 className="nes-text">🚀 Reward Mechanics</h3>
              <ul className="nes-list is-disc">
                <li><span className="nes-text is-primary">Launch Airdrop:</span> First 420 players to score 100+ points share 42.0% of total token supply</li>
                <li><span className="nes-text is-success">Weekly Rewards:</span> Top 50 players by XP share 50% of LP fees</li>
                <li><span className="nes-text is-warning">Continuous Earning:</span> Keep playing to earn more XP</li>
              </ul>
            </div>

            {/* CTA Card */}
            <div className="bento-card cta-card">
              <Link to="/play" className="nes-btn is-primary">Start Playing</Link>
              <p className="cta-note">Score 100+ points to qualify for the initial airdrop!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Airdrop; 