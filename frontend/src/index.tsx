import { StrictMode, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import Login from './components/Login';
import Player from './components/Player';

interface UserData {
  userName: string;
  userImage: string;
}

const Spotbar = () => {
  const [auth, setAuth] = useState(false);
  const [userData, setUserData] = useState<UserData>({ userName: '', userImage: '' });

  const loginWithSpotify = async () => {
    const status = await window.api.login();
    alert(status);
  };

  return auth ?
    <Player {...userData} /> :
    <Login loginClickHandler={() => loginWithSpotify()} />
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
        .render(<StrictMode><Spotbar /></StrictMode>);
