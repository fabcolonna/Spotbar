import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SpotifyDevice } from 'src/@types/spotify'
import DeviceButton from './spotify-connect-sub/DeviceButton'
import { ScaleInDiv, ScaleInSection } from '../ui-elements/AnimatedContainers'
import { IconButton } from '../ui-elements/CustomButtons'

export default function SpotifyConnect() {
  const [isPlaying, setIsPlaying] = useState(false) // Only for animation reasons
  const [devices, setDevices] = useState<SpotifyDevice[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const ival = setInterval(async () => {
      if (!(await window.spotbar.isVisible())) return

      window.spotify
        .fetchPlaybackInfo()
        .then(async data => setIsPlaying(data ? data.isPlaying : false))
        .catch(() => setIsPlaying(false))
    }, 1000)

    return () => clearInterval(ival)
  }, [])

  useEffect(() => {
    const ival = setInterval(() => {
      window.spotify
        .getSpotifyConnectDevices()
        .then(setDevices)
        .catch(_ => setDevices([]))
    }, 2000)

    return () => clearInterval(ival)
  }, [])

  return (
    <ScaleInSection className="login-sec">
      <h1 className="font-black text-3xl">Where do you wanna cast?</h1>

      <div className="h-[55%] flex items-center justify-center flex-wrap w-[85%]">
        {devices.length > 0 ? (
          devices.slice(0, 9).map(dev => (
            <motion.span
              key={dev.name}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 70, damping: 15 } }}
              exit={{ opacity: 0, transition: { ease: 'easeIn' } }}
            >
              <DeviceButton
                key={dev.name}
                device={dev}
                isPlaying={isPlaying}
              />
            </motion.span>
          ))
        ) : (
          <motion.div
            className="font-black text-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { type: 'spring', stiffness: 70, damping: 15 } }}
            exit={{ opacity: 0, scale: 0.5, transition: { ease: 'easeIn' } }}
          >
            <h2>Searching available devices...</h2>
          </motion.div>
        )}
      </div>

      <ScaleInDiv className="mt-2">
        <IconButton
          className="login-btn-smaller mr-1 h-full w-fit"
          onClick={() => navigate('/player')}
          iconName={faArrowLeft}
          iconClassName="inline-block"
        />
      </ScaleInDiv>
    </ScaleInSection>
  )
}
