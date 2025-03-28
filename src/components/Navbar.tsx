import { Link, useLocation } from 'react-router-dom';
import { UserProfile } from './UserProfile';
import Auth from './Auth';
import 'nes.css/css/nes.min.css';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const getLeftNavText = () => {
    if (currentPath === '/leaderboard') {
      return { to: '/', text: 'Home' };
    }
    return { to: '/leaderboard', text: 'Leaderboard' };
  };

  const getCenterNavText = () => {
    if (currentPath === '/airdrop') {
      return { to: '/', text: 'Home' };
    }
    return { to: '/airdrop', text: 'Airdrop' };
  };

  const leftNav = getLeftNavText();
  const centerNav = getCenterNavText();

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <Link to={leftNav.to} className="nes-text">{leftNav.text}</Link>
        </div>
        
        <div className="navbar-center">
          <Link to={centerNav.to} className="nes-text is-primary">{centerNav.text}</Link>
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