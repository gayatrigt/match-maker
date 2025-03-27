import React from 'react';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
  onPlay: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onPlay }) => {
  return (
    <div className="welcome-screen">
      <div className="crypto-coins">
        <div className="coin ethereum"></div>
        <div className="coin bitcoin"></div>
        <div className="coin solana"></div>
        <div className="coin ethereum" style={{ top: '70%', left: '70%', animationDelay: '3s' }}></div>
        <div className="coin bitcoin" style={{ top: '30%', left: '80%', animationDelay: '4s' }}></div>
        <div className="coin solana" style={{ top: '80%', left: '20%', animationDelay: '5s' }}></div>
      </div>
      <div className="retro-container">
        <h1 className="retro-title">CRYPTO MATCH</h1>
        <button className="play-button" onClick={onPlay}>
          PRESS START
          <div className="button-glint"></div>
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen; 