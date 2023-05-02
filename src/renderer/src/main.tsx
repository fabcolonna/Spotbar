import { AnimatePresence } from 'framer-motion'
import { StrictMode, useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { SpotifyMe } from '../../@types/spotify'
import './assets/index.css'
import { Error, Login, Player, SpotifyConnect, Welcome } from './components'
import { playbackInfoStore } from './playback-info-state/pb-store'
import { checkNetwork } from './utilities/utils'
import * as Form from '@radix-ui/react-form'
import { ScaleInSection } from './ui-elements/AnimatedContainers'
import { IconButton } from './ui-elements/CustomButtons'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons/faCheckCircle'

type Status = {
  logged: boolean
  user?: SpotifyMe
}

const SpotbarRoutes = () => {
  const [credFileOk, setCredFileOk] = useState(false)

  const LOGGED_OUT: Status = { logged: false }
  const [status, setStatus] = useState<Status>(LOGGED_OUT)

  const navigate = useNavigate()
  const location = useLocation()

  // Used to retrieve the token file
  useEffect(() => {
    window.spotbar.didFindCredentials().then(setCredFileOk)
  }, [credFileOk])

  const trySetCredentials = async event => {
    event.preventDefault() // This is important, Radix performs some other unwanted thing otherwise

    window.spotbar
      .loadCredentials({
        clientId: event.target[0].value,
        clientSecret: event.target[1].value
      })
      .then(setCredFileOk)
  }

  const forgetCredentials = () => {
    window.spotbar.unloadCredentials()
    setCredFileOk(false)
  }

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

  if (!credFileOk)
    return (
      <ScaleInSection className="login-sec">
        <h1 className="font-black text-3xl mb-2">Credentials not found!</h1>

        <Form.Root
          className="w-[260px] justify-center items-center text-center"
          onSubmit={trySetCredentials}
        >
          <Form.Field
            className="grid mb-[5px]"
            name="id"
          >
            <div className="flex items-baseline justify-between">
              <Form.Label className="font-bold text-sm leading-[35px] text-white">Client ID</Form.Label>
              <Form.Message
                className="text-white text-sm opacity-[0.8]"
                match="valueMissing"
              >
                Enter your CID here!
              </Form.Message>
            </div>
            <Form.Control asChild>
              <input
                className="text-black text-sm rounded-full w-full inline-flex h-[35px] items-center text-center justify-center px-[10px]"
                type="text"
                required
              />
            </Form.Control>
          </Form.Field>

          <Form.Field
            className="grid mb-[5px]"
            name="sec"
          >
            <div className="flex items-baseline justify-between">
              <Form.Label className="font-bold text-sm leading-[35px] text-white">Client Secret</Form.Label>
              <Form.Message
                className="text-white text-sm opacity-[0.8]"
                match="valueMissing"
              >
                Enter your CSEC here!
              </Form.Message>
            </div>
            <Form.Control asChild>
              <input
                className="text-black text-sm rounded-full w-full inline-flex h-[35px] items-center text-center justify-center px-[10px]"
                type="password"
                required
              />
            </Form.Control>
          </Form.Field>

          <Form.Submit asChild>
            <div>
              <IconButton
                className="login-btn-smaller mt-3"
                iconName={faCheckCircle}
                iconClassName="inline-block"
              ></IconButton>
            </div>
          </Form.Submit>
        </Form.Root>
      </ScaleInSection>
    )

  return (
    <AnimatePresence>
      <Provider store={playbackInfoStore}>
        <Routes
          location={location}
          key={location.pathname}
        >
          <Route
            path="/"
            element={
              status.logged ? (
                <Navigate to="/welcome" />
              ) : (
                <Login
                  onLogin={login}
                  onForgetCredentials={forgetCredentials}
                />
              )
            }
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
