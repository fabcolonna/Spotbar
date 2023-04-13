import { createContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AlbumCover from './AlbumCover'
import { checkInternetPeriodically } from '../..'
import { Controls } from './Controls'

const NULL_PB: SpotifyPlaybackStatus = {
   device: { name: '', type: '', volume: 0 },
   track: { title: 'Nothing is playing', artists: '', album: '', progressMilli: null, durationMilli: 0 },
   isPlaying: false
}

export const pbContext = createContext<SpotifyPlaybackStatus>(NULL_PB)

export function Player() {
   const [pbStatus, setPbStatus] = useState<SpotifyPlaybackStatus>(NULL_PB)
   const navigate = useNavigate()
   const location = useLocation()

   useEffect(() => {
      checkInternetPeriodically(10, 10, () => {
         if (location.pathname !== '/error') navigate('/error/Spotbar needs internet to control Spotify')
      })
   })

   useEffect(() => {
      const ival = setInterval(() => {
         window.spotifyApi
            .getPlaybackStatus()
            .then(data => setPbStatus(data || NULL_PB))
            .catch(err => {
               setPbStatus(NULL_PB)
               navigate('/error/' + err)
            })
      }, 1000);

      return () => clearInterval(ival)
   })

   return (
      <div className="flex">
         <pbContext.Provider value={pbStatus}>
            <Controls />
            {pbStatus.track.albumImage ? <AlbumCover /> : <span />}
         </pbContext.Provider>
      </div>
   )
}
