import { AnimatePresence } from 'framer-motion'
import { StrictMode, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { SpotifyMe } from '../../@types/spotify'
import './assets/index.css'
import { checkConnection } from './utilities/utils'
import { Err, Login, Player, Welcome } from './components'

type Status = {
  logged: boolean
  user?: SpotifyMe
}

const SpotbarRoutes = () => {
  const LOGGED_OUT: Status = { logged: false }
  const [status, setStatus] = useState<Status>(LOGGED_OUT)

  const navigate = useNavigate()
  const location = useLocation()

  const login = () => {
    checkConnection(
      7,
      () => location.pathname !== '/error' && navigate('/error/Spotbar needs internet to control Spotify'),
      () => {
        window.spotify
          .getMe()
          .then(me => setStatus({ logged: true, user: me }))
          .catch(err => navigate('/error/' + err))
      }
    )
  }

  const logout = () => setStatus(LOGGED_OUT)

  return (
    <AnimatePresence>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={status.logged ? <Navigate to="/welcome" /> : <Login onLogin={login} />} />
        <Route path="/welcome" element={<Welcome {...status.user!} onLogout={logout} />} />
        <Route path="/player" element={<Player />} />
        <Route path="/error/:message" element={<Err onLogout={logout} />} />
      </Routes>
    </AnimatePresence>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <SpotbarRoutes />
    </BrowserRouter>
  </StrictMode>
)
