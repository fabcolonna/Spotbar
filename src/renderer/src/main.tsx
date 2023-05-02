import { AnimatePresence } from 'framer-motion'
import { StrictMode, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { SpotifyMe } from '../../@types/spotify'
import './assets/index.css'
import { Error, Login, Player, SpotifyConnect, Welcome } from './components'
import { playbackInfoStore } from './playback-info-state/pb-store'
import { checkNetwork } from './utilities/utils'

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
    checkNetwork(
      7,
      message => location.pathname !== '/error' && navigate(`/error/${message}`),
      () => {
        window.spotify
          .getMe()
          .then(me => setStatus({ logged: true, user: me }))
          .catch(err => navigate(`/error/${err}`))
      }
    )
  }

  const logout = () => {
    setStatus(LOGGED_OUT)
    navigate('/')
  }

  return (
    <AnimatePresence>
      <Provider store={playbackInfoStore}>
        <Routes
          location={location}
          key={location.pathname}
        >
          <Route
            path="/"
            element={status.logged ? <Navigate to="/welcome" /> : <Login onLogin={login} />}
          />
          <Route
            path="/welcome"
            element={
              status.user && (
                <Welcome
                  {...status.user}
                  onLogout={logout}
                />
              )
            }
          />
          <Route
            path="/error/:message"
            element={<Error onLogout={logout} />}
          />
          <Route
            path="/player"
            element={<Player onLogout={logout} />}
          />
          <Route
            path="/sconnect"
            element={<SpotifyConnect />}
          />
        </Routes>
      </Provider>
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
