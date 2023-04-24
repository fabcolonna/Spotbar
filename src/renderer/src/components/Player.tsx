import { createContext, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AlbumArt from './player/AlbumArt'
import PlaybackControls, { ControlsEvents } from './player/Controls'
import { SpotifyPlaybackInfo } from '../../../@types/spotify'
import { checkConnection, extractHexSwatch, getRandomColorFromSwatch } from '../utilities/utils'

export const nullPlayback: SpotifyPlaybackInfo = {
  device: { name: '', type: '', volume: 0 },
  track: { id: '', title: 'Nothing is playing!', artists: '', album: '', progressMs: null, durationMs: 0 },
  playing: false
}

export const playerContext = createContext<SpotifyPlaybackInfo>(nullPlayback)

// TODO: PlaybackControls callback functions

export function Player() {
  const [info, setInfo] = useState<SpotifyPlaybackInfo>(nullPlayback)
  const [trackSaved, setTrackSaved] = useState(false)

  const [swatch, setSwatch] = useState<string[]>([])

  const navigate = useNavigate()
  const location = useLocation()
  const prevImage = useRef<string>('')

  useEffect(() => {
    const ival = setInterval(() => {
      console.log('Checking internet: ')
      checkConnection(
        7,
        () => {
          console.log('Not connected')
          location.pathname !== '/error' && navigate('/error/Spotbar needs internet to control Spotify')
        },
        () => console.log('Connected')
      )
    }, 20000)

    return () => clearInterval(ival)
  }, [location.pathname, navigate])

  useEffect(() => {
    const ival = setInterval(async () => {
      if (!(await window.spotbar.isVisible())) return

      window.spotify
        .fetchPlaybackInfo()
        .then(async data => {
          setInfo(data || nullPlayback)
          if (data) window.spotify.isTrackSaved(data?.track.id).then(setTrackSaved)
          console.log('\n DATA: ' + JSON.stringify(data || nullPlayback))
        })
        .catch(() => setInfo(nullPlayback))
    }, 900)

    return () => clearInterval(ival)
  }, []) // Executes once

  useEffect(() => {
    console.log('Trying to set swatches...')

    if (!info.track.albumArt) {
      setSwatch([])
      return
    }

    if (prevImage.current === info.track.albumArt.url) return // Already done

    extractHexSwatch(info.track.albumArt).then(cols => {
      setSwatch(cols)
      prevImage.current = info.track.albumArt!.url
    })
  }, [info.track.albumArt])

  // These functions modify the state indirectly -> the useEffect hook that monitors the PlaybackInfo
  // will render the changes by modifing the info state. At that point, the Player component will re-render
  // alongside every other component that is using the info state through the useContext hook.

  const controlsHandlers: ControlsEvents = {
    trackSaved: trackSaved,

    onTogglePlayback: async () => await window.spotify.togglePlayback(info.playing ? 'pause' : 'play'),
    onSkipTrack: async (which: 'previous' | 'next') => await window.spotify.skipTrack(which),
    onToggleSaveTrack: async () =>
      await window.spotify
        .toggleSaveTrack(info.track.id)
        .then(res => setTrackSaved(res === 'added'))
        .catch(console.log)
  }

  return (
    <div>
      <playerContext.Provider value={info}>
        {info.track.albumArt ? (
          <motion.div
            className="w-screen h-screen flex music-album-div z-10"
            style={{ background: `linear-gradient(90deg, ${getRandomColorFromSwatch(swatch)}, ${getRandomColorFromSwatch(swatch)})` }}
            animate={{ background: `linear-gradient(90deg, ${getRandomColorFromSwatch(swatch)}, ${getRandomColorFromSwatch(swatch)})` }}
            transition={{ duration: 8, repeat: Infinity }}>
            <AlbumArt art={info.track.albumArt} />
            <PlaybackControls {...controlsHandlers} />
          </motion.div>
        ) : (
          <PlaybackControls {...controlsHandlers} />
        )}
      </playerContext.Provider>
    </div>
  )
}
