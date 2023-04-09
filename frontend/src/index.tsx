import { StrictMode, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import ReactDOM from 'react-dom/client'

import './index.css'
import Login from './components/Login'
import Welcome from './components/Welcome'
import Player from './components/Player'
import Error from './components/Error'

const SpotbarRoutes = () => {
   const [logged, setLogged] = useState(false)
   const [userData, setUserData] = useState<SpotifyMe>({ name: '' })
   const navigate = useNavigate()
   const location = useLocation()

   const login = () => {
      window.spotifyApi
         .loginGetMe()
         .then((me) => {
            setUserData(me)
            setLogged(true)
         })
         .catch((err) => {
            alert(err)
            setUserData({ name: '' })
            setLogged(false)
            navigate('/error', { state: { message: err } })
         })
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
            <Route path="/error" element={<Error />} />
         </Routes>
      </AnimatePresence>
   )
}

const Spotbar = () => {
   return (
      <BrowserRouter>
         <SpotbarRoutes />
      </BrowserRouter>
   )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
   <StrictMode>
      <Spotbar />
   </StrictMode>
)
