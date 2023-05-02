import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVolumeHigh } from '@fortawesome/free-solid-svg-icons'
import { SpotifyDevice } from 'src/@types/spotify'
import { useEffect, useState } from 'react'
import DeviceIcon from './DeviceIcon'
import { motion } from 'framer-motion'
import { debounce } from 'lodash'

export default function DeviceButton(props: { device: SpotifyDevice; isPlaying: boolean }) {
  const [scaleAnimation, setScaleAnimation] = useState(1)
  const [volume, setVolume] = useState(props.device.volume || 0)

  useEffect(() => {
    const ival = setInterval(() => {
      setScaleAnimation(Math.random() * 0.1 + 0.9)
    }, 100)

    return () => clearInterval(ival)
  }, [])

  const debounceSendVolume = debounce(() => {
    window.spotify.setVolume(volume, props.device)
  }, 1250)

  const onSetVolume = evt => {
    const deltaAbs = Math.abs(evt.deltaY)
    const deltaSign = Math.sign(evt.deltaY)

    let step: number
    if (deltaAbs > 200) step = deltaSign * 2
    else if (deltaAbs < 50) step = deltaSign
    else step = Math.sign(evt.deltaY) * 2

    setVolume(Math.min(100, Math.max(0, volume + step)))
    debounceSendVolume()
  }

  return (
    <motion.button
      onClick={() => window.spotify.changeStreamingDevice(props.device)}
      key={props.device.name}
      style={props.device.isActive && props.isPlaying ? { scale: scaleAnimation } : {}}
      className={`${props.device.isActive ? 'login-btn button-modified-hover' : 'bg-transparent text-white border-2'} inline-block 
      cursor-pointer rounded-full text-center border-[#1db954] m-1 ml-2 mr-2 px-5 py-[0.5]
      `}
    >
      <span className="mr-2">
        <DeviceIcon type={props.device.type} />
      </span>
      {props.device.name}
      {props.device.isActive ? (
        <div
          className="inline-flex items-center justify-center ml-2 -mr-2 bg-[#0e5b2a] h-max rounded-full px-4 py-1 text-white"
          onWheel={event => onSetVolume(event)}
        >
          <FontAwesomeIcon
            icon={faVolumeHigh}
            size="xs"
            fixedWidth
            className="mr-2"
          />
          {volume}%
        </div>
      ) : (
        <></>
      )}
    </motion.button>
  )
}
