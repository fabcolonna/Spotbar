import { faSpotify } from '@fortawesome/free-brands-svg-icons'
import { useState } from 'react'
import { ScaleInSection } from '../ui-elements/AnimatedContainers'
import { IconButton } from '../ui-elements/CustomButtons'
import { faUserMinus } from '@fortawesome/free-solid-svg-icons'

export default function Login(props: { onLogin: () => void; onForgetCredentials: () => void }) {
  const [inputOff, setInputOff] = useState(false)

  const login = () => {
    setInputOff(true)
    props.onLogin()
  }

  return (
    <ScaleInSection className="login-sec">
      <h1 className="font-black text-3xl">Welcome to Spotbar!</h1>

      <div className="mt-2 justify-center items-center text-center">
        <IconButton
          className="login-btn"
          onClick={login}
          disabled={inputOff}
          iconName={faSpotify}
          iconSize="2x"
          iconClassName="mr-2 inline-block"
        >
          <span className="inline-block pr-1">Login with Spotify...</span>
        </IconButton>
      </div>

      <IconButton
        className="absolute right-0 bottom-0 px-1 py-1 bg-transparent text-white"
        iconName={faUserMinus}
        onClick={props.onForgetCredentials}
      />
    </ScaleInSection>
  )
}
