import React from 'react';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
  onPlay: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onPlay }) => {
  return (
    <div className="welcome-screen">
      <div className="blockchain-grid"></div>
      <div className="web3-bg">
        <div className="node"></div>
        <div className="node"></div>
        <div className="node"></div>
        <div className="node"></div>
        <div className="crypto-symbol eth">Ξ</div>
        <div className="crypto-symbol btc">₿</div>
        <div className="crypto-symbol eth">Ξ</div>
        <div className="crypto-symbol sol">S</div>
        <div className="crypto-symbol btc">₿</div>
        <div className="chain-circle"></div>
        <div className="chain-circle"></div>
        <div className="chain-circle"></div>
      </div>
      <div className="retro-container">
        <h1 className="retro-title">Crypto</h1>
        <h1 className="retro-title">Match</h1>
        <div className="retro-illustration">
          <div className="joystick">
            <div className="stick"></div>
          </div>
          <div className="game-console">
            <div className="console-screen">
              <div className="pixel-character"></div>
            </div>
            <div className="controls">
              <div className="d-pad"></div>
              <div className="action-buttons">
                <div className="action-button"></div>
                <div className="action-button"></div>
              </div>
            </div>
          </div>
        </div>
        <button className="play-button" onClick={onPlay}>
          Press Start
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen; 