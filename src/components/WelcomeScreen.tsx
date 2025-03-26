import React from 'react';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
  onPlay: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onPlay }) => {
  return (
    <div className="welcome-screen">
      <div className="retro-container">
        <h1 className="retro-title">
          <span className="line1">CRYPTO</span>
          <span className="line2">MATCH</span>
        </h1>

        <div className="retro-illustration">
          <div className="eth-device">
            <div className="screen">
              <div className="eth-symbol">Ξ</div>
            </div>
            <div className="device-body">
              <div className="d-pad">
                <div className="d-pad-horizontal"></div>
                <div className="d-pad-vertical"></div>
              </div>
              <div className="buttons">
                <div className="button"></div>
                <div className="button"></div>
              </div>
            </div>
          </div>
        </div>

        <button className="play-button" onClick={onPlay}>
          PRESS START
          <div className="button-glint"></div>
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen; 