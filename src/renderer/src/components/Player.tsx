import { faBackwardStep, faForwardStep, faHeart, faLaptop, faPause, faPlay, faPowerOff, faSignOut } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { motion } from 'framer-motion'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { SpotifyImage, SpotifyPlaybackInfo } from '../../../@types/spotify'
import { checkConnection, extractHexSwatch, getRandomColor } from '@renderer/utilities/utils'

type ControlsProps = {
  trackSaved: boolean
  onTogglePlayback: () => void
  onSkipTrack: (which: 'previous' | 'next') => void
  onToggleSaveTrack: () => void
}

const NOTHING_PLAYING: SpotifyPlaybackInfo = {
  device: { name: '', type: '', volume: 0 },
  track: { id: '', title: 'Nothing is playing!', artists: '', album: '', progressMs: null, durationMs: 0 },
  playing: false
}

const context = createContext<SpotifyPlaybackInfo>(NOTHING_PLAYING)

const TextInfo = () => {
  const info = useContext(context)

  return (
    <div className="w-60 flex-1">
      <h3 className="font-semibold text-sm text-white text-center mb-2">
        {info !== NOTHING_PLAYING && (
          <div>
            Listening on <b>{info.device.name}</b>
          </div>
        )}
      </h3>
      <h2 className="font-black text-2xl text-center scroll-cont">
        <div>{info.track.title}</div>
      </h2>
      <h2 className="font-extrabold text-base text-center scroll-cont">
        <div>{info.track.album}</div>
      </h2>
      <h3 className="font-normal text-sm text-white text-center scroll-cont">
        <div>{info.track.artists}</div>
      </h3>
    </div>
  )
}

const AlbumArt = (props: { art: SpotifyImage }) => {
  const [key, setKey] = useState<string>(props.art.url)
  const [stopAnimation, setStopAnimation] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setKey(props.art.url) // Key changes after 500ms the real change happened, exit animation can start
      setStopAnimation(false) // Animation can resume
    }, 500)

    setStopAnimation(true)
  }, [props.art.url])

  return (
    <motion.div
      key={key}
      className="flex-1 max-h-fit min-h-fit min-w-fit max-w-fit shadow-2xl rounded-full shadow-gray-900 z-20"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={
        stopAnimation
          ? { opacity: 0, scale: 0.5, transition: { ease: 'easeIn', duration: 0.5 } }
          : { opacity: 1, scale: 0.8, transition: { type: 'spring', damping: 4, stiffness: 30 } }
      }>
      <motion.img
        alt="cover"
        src={key}
        className="h-screen rounded-full shadow-2x shadow-gray-600"
        animate={{ rotate: 360, transition: { duration: 5, repeat: Infinity, ease: 'linear' } }}
      />
    </motion.div>
  )
}

const Controls = (props: ControlsProps) => {
  const info = useContext(context)

  return (
    <motion.div
      className={`flex-1 flex flex-col h-screen -ml-3 items-center justify-center ${info !== NOTHING_PLAYING ? 'w-fit' : 'w-screen'}`}
      initial={{ opacity: 0, scale: 0.5, x: '0%' }}
      animate={
        info !== NOTHING_PLAYING
          ? { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 70, damping: 15 } }
          : { x: '0%', transition: { ease: 'easeIn' } }
      }
      exit={{ opacity: 0, scale: 0.5, x: '0%', transition: { ease: 'easeIn' } }}>
      <div className="flex justify-between items-center">
        <button className="small-control-btn text-white" onClick={props.onToggleSaveTrack} style={props.trackSaved ? { backgroundColor: '#1db954' } : {}}>
          <FontAwesomeIcon icon={faHeart} fixedWidth />
        </button>

        <TextInfo />

        <button className="small-control-btn text-white">
          <FontAwesomeIcon icon={faLaptop} fixedWidth />
        </button>
      </div>

      <section>
        <div className="mb-5 mt-10">
          <button className="control-btn px-4 py-4 bg-transparent text-white">
            <FontAwesomeIcon icon={faBackwardStep} size="2x" fixedWidth onClick={() => props.onSkipTrack('previous')} />
          </button>

          <button className="control-btn">
            <FontAwesomeIcon icon={info.playing ? faPause : faPlay} size="2x" fixedWidth onClick={props.onTogglePlayback} />
          </button>

          <button className="control-btn px-4 py-4 bg-transparent text-white" onClick={() => props.onSkipTrack('next')}>
            <FontAwesomeIcon icon={faForwardStep} size="2x" fixedWidth />
          </button>
        </div>
      </section>

      <button className="absolute right-0 bottom-0 px-1 py-1 bg-transparent text-white">
        <FontAwesomeIcon icon={faSignOut} fixedWidth />
      </button>

      <button className="absolute right-0 top-0 px-1 py-1 bg-transparent text-white">
        <FontAwesomeIcon icon={faPowerOff} fixedWidth />
      </button>
    </motion.div>
  )
}

export default function Player() {
  const [info, setInfo] = useState<SpotifyPlaybackInfo>(NOTHING_PLAYING)
  const [trackSaved, setTrackSaved] = useState(false)
  const [swatch, setSwatch] = useState<string[]>([])
  const prevImage = useRef<string>('')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const ival = setInterval(
      () => checkConnection(7, () => location.pathname !== '/error' && navigate('/error/Spotbar needs internet to control Spotify')),
      20000
    )
    return () => clearInterval(ival)
  }, [location.pathname, navigate])

  useEffect(() => {
    const ival = setInterval(async () => {
      if (!(await window.spotbar.isVisible())) return

      window.spotify
        .fetchPlaybackInfo()
        .catch(() => setInfo(NOTHING_PLAYING))
        .then(async data => {
          setInfo(data || NOTHING_PLAYING)
          if (data) window.spotify.isTrackSaved(data?.track.id).then(setTrackSaved)
        })
    }, 900)

    return () => clearInterval(ival)
  }, []) // Executes once

  useEffect(() => {
    if (!info.track.albumArt) {
      setSwatch([])
      return
    }

    if (prevImage.current === info.track.albumArt.url) return // Already done

    extractHexSwatch(info.track.albumArt).then(cols => {
      prevImage.current = info.track.albumArt!.url
      setSwatch(cols)
    })
  }, [info.track.albumArt])

  // These functions modify the state indirectly -> the useEffect hook that monitors the PlaybackInfo
  // will render the changes by modifing the info state. At that point, the Player component will re-render
  // alongside every other component that is using the info state through the useContext hook.
  const controlsHandlers: ControlsProps = {
    trackSaved: trackSaved,
    onTogglePlayback: async () => await window.spotify.togglePlayback(info.playing ? 'pause' : 'play'),
    onSkipTrack: async (which: 'previous' | 'next') => await window.spotify.skipTrack(which),
    onToggleSaveTrack: async () => await window.spotify.toggleSaveTrack(info.track.id).then(res => setTrackSaved(res === 'added'))
  }

  return (
    <div>
      <context.Provider value={info}>
        {info.track.albumArt ? (
          <motion.div
            className="w-screen h-screen flex music-album-div z-10"
            style={{ background: `linear-gradient(90deg, ${getRandomColor(swatch)}, ${getRandomColor(swatch)})` }}
            animate={{ background: `linear-gradient(90deg, ${getRandomColor(swatch)}, ${getRandomColor(swatch)})` }}
            transition={{ duration: 8, repeat: Infinity }}>
            <AlbumArt art={info.track.albumArt} />
            <Controls {...controlsHandlers} />
          </motion.div>
        ) : (
          <Controls {...controlsHandlers} />
        )}
      </context.Provider>
    </div>
  )
}
