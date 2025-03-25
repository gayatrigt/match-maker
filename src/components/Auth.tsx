import { usePrivy } from '@privy-io/react-auth';
import 'nes.css/css/nes.min.css';
import './Auth.css';

const Auth = () => {
  const { login, authenticated, logout } = usePrivy();

  return (
    <button
      onClick={authenticated ? logout : login}
      className={`nes-btn ${authenticated ? 'is-error' : 'is-primary'}`}
    >
      {authenticated ? "Logout" : "Login"}
    </button>
  );
};

export default Auth; 