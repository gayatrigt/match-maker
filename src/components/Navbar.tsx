import { Link } from 'react-router-dom';
import { UserProfile } from './UserProfile';
import Auth from './Auth';
import 'nes.css/css/nes.min.css';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <Link to="/leaderboard" className="nes-text">Leaderboard</Link>
        </div>
        
        <div className="navbar-center">
          <Link to="/" className="nes-text is-primary">Match Maker</Link>
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