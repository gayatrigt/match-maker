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
          
          <div className="launch-info">
            <h1 className="nes-text is-primary">Crypto Match Token (CMT)</h1>
            
            <div className="progress-section">
              <div className="progress-info">
                <span>{qualifiedUsers} / {TARGET_USERS} Players Qualified</span>
                <progress 
                  className="nes-progress is-success" 
                  value={progressPercentage} 
                  max="100"
                />
              </div>
            </div>

            <div className="info-section">
              <h3 className="nes-text">🎮 Play-to-Learn Revolution</h3>
              <p>
                Crypto Match is pioneering the Play-to-Learn movement in Web3. 
                We believe learning about blockchain technology should be fun, 
                engaging, and rewarding. By playing Crypto Match, you're not 
                just earning tokens - you're building valuable knowledge for 
                the decentralized future.
              </p>
            </div>

            <div className="info-section">
              <h3 className="nes-text">🎯 How to Qualify</h3>
              <div className="qualification-steps">
                <div className="step">
                  <span className="step-number">1</span>
                  <p><Link to="/play" className="nes-text is-primary">Play the game</Link> and match Web3 terms with their definitions</p>
                </div>
                <div className="step">
                  <span className="step-number">2</span>
                  <p>Score 100+ points in any game mode to join the first 420 players</p>
                </div>
                <div className="step">
                  <span className="step-number">3</span>
                  <p>Keep earning XP to qualify for weekly rewards</p>
                </div>
              </div>
            </div>

            <div className="info-section">
              <h3 className="nes-text">🪙 Token Distribution</h3>
              <div className="token-grid">
                <div className="token-detail">
                  <span className="detail-label">Initial Airdrop</span>
                  <span className="detail-value">10% of Supply</span>
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

            <div className="info-section">
              <h3 className="nes-text">🚀 Reward Mechanics</h3>
              <ul className="nes-list is-disc">
                <li><span className="nes-text is-primary">Launch Airdrop:</span> First 420 players to score 100+ points share 10% of total token supply</li>
                <li><span className="nes-text is-success">Weekly Rewards:</span> Top 50 players by XP share 50% of LP fees</li>
                <li><span className="nes-text is-warning">Continuous Earning:</span> Keep playing to earn more XP and increase your weekly rewards</li>
                <li><span className="nes-text is-error">Fair Distribution:</span> Weekly rewards based on relative XP earned</li>
              </ul>
            </div>

            <div className="info-section">
              <h3 className="nes-text">💡 Why This Model?</h3>
              <p>
                Our dual reward system encourages both early adoption and continued 
                engagement. The initial airdrop rewards our early community of 420 
                pioneers, while weekly rewards ensure long-term participation and 
                learning. This creates a sustainable ecosystem where knowledge and 
                engagement are consistently rewarded! 🎮
              </p>
            </div>

            <div className="cta-section">
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