import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { StrictMode, useState } from 'react'
import ReactDOM from 'react-dom/client'

import Error from './components/Error'
import Login from './components/Login'
import Welcome from './components/Welcome'
import { Player } from './components/Player'

import './assets/index.css'
import { checkConnection } from './utilities/utils'
import { SpotifyMe } from '../../@types/spotify'

const SpotbarRoutes = () => {
  const [logged, setLogged] = useState(false)
  const [userData, setUserData] = useState<SpotifyMe>({ name: '' })

  const navigate = useNavigate()
  const location = useLocation()

  const login = () => {
    checkConnection(
      7,
      () => location.pathname !== '/error' && navigate('/error/Spotbar needs internet to control Spotify'),
      () => {
        window.spotify
          .getMe()
          .then(me => {
            setUserData(me)
            setLogged(true)
          })
          .catch(err => navigate('/error/' + err))
      }
    )
  }

  const logout = () => {
    setUserData({ name: '' })
    setLogged(false)
    navigate('/')
  }

  return (
    <AnimatePresence>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={logged ? <Navigate to="/welcome" /> : <Login onLogin={login} />} />
        <Route path="/welcome" element={logged ? <Welcome {...userData} onLogout={logout} /> : <Navigate to="/" />} />
        <Route path="/player" element={logged ? <Player /> : <Navigate to="/" />} />
        <Route path="/error/:message" element={<Error onLogout={logout} />} />
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
