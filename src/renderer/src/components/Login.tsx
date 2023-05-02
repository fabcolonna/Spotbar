import { faSpotify } from '@fortawesome/free-brands-svg-icons'
import { useState } from 'react'
import { ScaleInSection } from '../ui-elements/AnimatedContainers'
import { IconButton } from '../ui-elements/CustomButtons'

export default function Login(props: { onLogin: () => void }) {
  const [inputOff, setInputOff] = useState(false)

  const login = () => {
    setInputOff(true)
    props.onLogin()
  }

  return (
    <ScaleInSection className="login-sec">
      <h1 className="font-black text-3xl">Welcome to Spotbar!</h1>

      <div className="mt-2">
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
    </ScaleInSection>
  )
}
