import { checkNetwork, extractHexSwatch, getRandomColor } from '@renderer/utilities/utils'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Controls from './player-sub/Controls'
import AlbumArt from './player-sub/AlbumArt'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@renderer/playback-info-state/pb-store'
import { set, unset } from '@renderer/playback-info-state/pb-state'
import { faMaximize, faMinimize } from '@fortawesome/free-solid-svg-icons'
import { IconButton } from '../ui-elements/CustomButtons'
import {isUnsetted} from "../playback-info-state/pb-state";
import DeviceIcon from "./spotify-connect-sub/DeviceIcon";

export default function Player(props: { onLogout: () => void }) {
  const pbInfo = useSelector((state: RootState) => state.playback)
  const unsetted = useSelector(isUnsetted) // Unstable
  const pbDispatch = useDispatch()

  const [os, setOs] = useState<string>()

  const [trackSaved, setTrackSaved] = useState(false)
  const [winSize, setWinSize] = useState<'big' | 'compact'>('big')
  const [swatch, setSwatch] = useState<string[]>([])

  const prevImage = useRef<string>('')
  const navigate = useNavigate()
  const location = useLocation()

  const toggleWindowSize = () => {
    window.spotbar.resize(winSize === 'big' ? 'compact' : 'big').then(newSize => {
      console.log(newSize)
      setWinSize(newSize)
    })
  }

  useEffect(() => {
    window.spotbar.getOs().then(setOs)
  }, [])

  useEffect(() => {
    const ival = setInterval(() => checkNetwork(7, msg => location.pathname !== '/error' && navigate(`/error/${msg}`)), 20000)
    return () => clearInterval(ival)
  }, [location.pathname, navigate])

  useEffect(() => {
    const ival = setInterval(async () => {
      if (!(await window.spotbar.isVisible())) return

      window.spotify
        .fetchPlaybackInfo()
        .then(async data => {
          data ? pbDispatch(set(data)) : pbDispatch(unset())
          if (data) window.spotify.isTrackSaved(data?.track.id).then(setTrackSaved)
        })
        .catch(() => pbDispatch(unset()))
    }, 1000)

    return () => clearInterval(ival)
  }, [pbDispatch]) // Executes once

  useEffect(() => {
    if (!pbInfo.track.albumArt) {
      setSwatch([])
      return
    }

    if (prevImage.current === pbInfo.track.albumArt.url) return // Already done

    extractHexSwatch(pbInfo.track.albumArt).then(cols => {
      prevImage.current = pbInfo.track.albumArt!.url
      setSwatch(cols)
    })
  }, [pbInfo.track.albumArt])

  // These functions modify the state indirectly -> the useEffect hook that monitors the PlaybackInfo
  // will render the changes by modifing the info state. At that point, the Player component will re-render
  // alongside every other component that is using the info state through the useContext hook.
  const controlsHandlers = {
    trackSaved: trackSaved,
    onTogglePlayback: async () => await window.spotify.togglePlayback(pbInfo.isPlaying ? 'pause' : 'play'),
    onSkipTrack: async (which: 'previous' | 'next') => await window.spotify.skipTrack(which),
    onToggleSaveTrack: async () => await window.spotify.toggleSaveTrack(pbInfo.track.id).then(res => setTrackSaved(res === 'added')),
    onLogout: () => {
      if (os === 'darwin' && winSize === 'compact') toggleWindowSize()
      props.onLogout()
    },
    onQuit: window.spotbar.quit,
    onShowSpotifyConnect: () => {
      if (os === 'darwin' && winSize === 'compact') toggleWindowSize()
      navigate('/sconnect')
    }
  }


  if (unsetted) return (
      <motion.div
          style={{ background: `linear-gradient(90deg, ${getRandomColor(swatch)}, ${getRandomColor(swatch)})` }}
          animate={{ background: `linear-gradient(90deg, ${getRandomColor(swatch)}, ${getRandomColor(swatch)})` }}
          transition={{ duration: 7, repeat: Infinity, repeatType: 'reverse' }}
      >
        <Controls
            {...controlsHandlers}
            fullWidth={true}
        />

        <button
            className="small-control-btn text-white"
            onClick={controlsHandlers.onShowSpotifyConnect}
        >
          <DeviceIcon type={pbInfo.device.type} />
        </button>
      </motion.div>
  )

  return (
    <motion.div
      style={{ background: `linear-gradient(90deg, ${getRandomColor(swatch)}, ${getRandomColor(swatch)})` }}
      animate={{ background: `linear-gradient(90deg, ${getRandomColor(swatch)}, ${getRandomColor(swatch)})` }}
      transition={{ duration: 7, repeat: Infinity, repeatType: 'reverse' }}
    >
      {pbInfo.track.albumArt && winSize === 'big' ? (
        <div className="w-screen h-screen flex music-album-div z-10">
          <AlbumArt />
          <Controls
            {...controlsHandlers}
            fullWidth={false}
          />
        </div>
      ) : (
        <Controls
          {...controlsHandlers}
          fullWidth={true}
        />
      )}

      {os === 'darwin' && (<IconButton
        className="absolute left-0 top-0 px-1 py-1 bg-transparent text-white"
        iconName={winSize === 'big' ? faMinimize : faMaximize}
        onClick={toggleWindowSize}
      />)}
    </motion.div>
  )
}
