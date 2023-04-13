import { AnimatePresence } from 'framer-motion'
import { StrictMode, useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import Error from './components/Error'
import Login from './components/Login'
import Welcome from './components/Welcome'
import { Player } from './components/player/Player'
import './index.css'

export const checkInternetPeriodically = (frequency: number, timeout: number, onInternetAbsent: () => void) => {
   const ival = setInterval(() => {
      // This fixes the timeout problem: if not present, without connection fetch
      // tries a lot of times without neither resolving or rejecting the Promise
      // making the whole frontend completely unresponsive
      const ctrl = new AbortController()
      const tout = setTimeout(() => {
         ctrl.abort()
         onInternetAbsent()
      }, timeout * 1000)

      fetch('https://www.google.com', { cache: 'no-cache', mode: 'no-cors', signal: ctrl.signal, method: 'HEAD' })
         .then(() => {
            clearTimeout(tout) // Clears timeout so abort() won't run
            //onInternetPresent && onInternetPresent()
         })
         .catch(onInternetAbsent)
   }, frequency * 1000)

   return () => clearInterval(ival)
}

const SpotbarRoutes = () => {
   const [logged, setLogged] = useState(false)
   const [userData, setUserData] = useState<SpotifyMe>({ name: '' })
   const navigate = useNavigate()
   const location = useLocation()

   useEffect(() => {
      checkInternetPeriodically(20, 4, () => {
         if (location.pathname !== '/error') navigate('/error/Spotbar needs internet to control Spotify')
      })
   })

   const login = () => {
      window.spotifyApi
         .loginGetMe()
         .then(me => {
            setUserData(me)
            setLogged(true)
         })
         .catch(err => navigate('/error/' + err))
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
