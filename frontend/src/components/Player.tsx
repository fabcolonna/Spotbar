import { createContext, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Utils } from '../utils'
import { AlbumArt, PlaybackControls } from './PlayerComponents'

export const nullPlayback: Spotify.PlaybackInfo = {
   device: { name: '', type: '', volume: 0 },
   track: { title: 'Nothing is playing!', artists: '', album: '', progressMs: null, durationMs: 0 },
   playing: false
}

export const playerContext = createContext<Spotify.PlaybackInfo>(nullPlayback)

export function Player() {
   const [info, setInfo] = useState<Spotify.PlaybackInfo>(nullPlayback)
   const [swatch, setSwatch] = useState<string[]>([])

   const navigate = useNavigate()
   const location = useLocation()
   const prevImage = useRef<string>('')

   useEffect(() => {
      const ival = setInterval(() => {
         console.log('Checking internet: ')
         Utils.Internet.checkConnection(7,
            () => {
               console.log('Not connected')
               location.pathname !== '/error' && navigate('/error/Spotbar needs internet to control Spotify')
            },
            () => console.log('Connected'))
      }, 20000)

      return () => clearInterval(ival)
   }, [location.pathname, navigate])

   useEffect(() => {
      const ival = setInterval(() => {
         window.spotify.fetchPlaybackInfo()
            .then(data => {
               setInfo(data || nullPlayback)
               console.log('\n DATA: ' + JSON.stringify(data || nullPlayback))
            })
            .catch(() => setInfo(nullPlayback))
      }, 1000)

      return () => clearInterval(ival)
   }, []) // Executes once

   useEffect(() => {
      if (!info.track.albumArt) {
         setSwatch([])
         return
      }

      if (prevImage.current === info.track.albumArt.url) return // Already done

      Utils.ImageColors.extractHexSwatch(info.track.albumArt)
         .then(cols => {
            setSwatch(cols)
            prevImage.current = info.track.albumArt!.url
         })
   }, [info.track.albumArt])

   return (
      <div>
         <playerContext.Provider value={info}>
            {
               info.track.albumArt
                  ? (
                     <motion.div
                        className="w-screen h-screen flex music-album-div z-10"
                        style={{ background: `linear-gradient(90deg, ${Utils.ImageColors.getRandom(swatch)}, ${Utils.ImageColors.getRandom(swatch)})` }}
                        animate={{ background: `linear-gradient(90deg, ${Utils.ImageColors.getRandom(swatch)}, ${Utils.ImageColors.getRandom(swatch)})` }}
                        transition={{ duration: 5, repeat: Infinity }}
                     >
                        <PlaybackControls />
                        <AlbumArt art={info.track.albumArt} />
                     </motion.div>
                  ) : <PlaybackControls />
            }
         </playerContext.Provider>
      </div>
   )
}
