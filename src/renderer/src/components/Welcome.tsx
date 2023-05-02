import { faPlay, faSignOut } from '@fortawesome/free-solid-svg-icons'
import { SpotifyMe } from '../../../@types/spotify'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RightSlideInSection } from '../ui-elements/AnimatedContainers'
import { IconButton } from '../ui-elements/CustomButtons'

interface Props extends SpotifyMe {
  onLogout: () => void
}

export default function Welcome(props: Props) {
  const navigate = useNavigate()

  return (
    <RightSlideInSection className="login-sec">
      {props.image && (
        <motion.div
          className="w-24 h-24 mb-3"
          initial={{ rotate: -270 }}
          animate={{ rotate: 0, transition: { type: 'spring', stiffness: 70, damping: 15 } }}
        >
          <img
            className="rounded-full"
            src={props.image.url}
            alt="Profile"
          />
        </motion.div>
      )}

      <div className="mb-2">
        <h1 className="font-black text-3xl">Welcome back, {props.name}!</h1>
      </div>

      <div className="mt-1">
        <IconButton
          className="login-btn-smaller mr-2 h-full w-fit"
          onClick={props.onLogout}
          iconName={faSignOut}
          iconClassName="inline-block pl-1 pr-1"
        />

        <IconButton
          className="login-btn-smaller ml-1"
          onClick={() => navigate('/player')}
          iconName={faPlay}
          iconClassName="mr-2 inline-block"
        >
          <span className="inline-block pr-1">Show Player</span>
        </IconButton>
      </div>
    </RightSlideInSection>
  )
}
