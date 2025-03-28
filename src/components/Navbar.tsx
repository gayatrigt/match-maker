import { Link, useLocation } from 'react-router-dom';
import { UserProfile } from './UserProfile';
import Auth from './Auth';
import 'nes.css/css/nes.min.css';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const isGameRoute = currentPath === '/' || currentPath === '/play';

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          {isGameRoute ? (
            <Link to="/leaderboard" className="nes-text">Leaderboard</Link>
          ) : (
            <Link to="/play" className="nes-btn is-primary">Play</Link>
          )}
        </div>
        
        <div className="navbar-center">
          {isGameRoute ? (
            <Link to="/airdrop" className="nes-text is-primary">Airdrop</Link>
          ) : (
            currentPath === '/airdrop' ? (
              <Link to="/leaderboard" className="nes-text">Leaderboard</Link>
            ) : (
              <Link to="/airdrop" className="nes-text is-primary">Airdrop</Link>
            )
          )}
        </div>
        
        <div className="navbar-right">
          <UserProfile />
          <Auth />
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 