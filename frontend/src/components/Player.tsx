import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart, faRadio, faBackwardStep, faPlay, faPause, faForwardStep, faPowerOff } from '@fortawesome/free-solid-svg-icons'
import { faSpotify } from '@fortawesome/free-brands-svg-icons'
import { useEffect, useState, createContext, useContext } from 'react'
import { useNavigate } from 'react-router-dom'

const NULL_PLAYING_INFO: SpotifyPlayingTrack = { name: 'Nothing playing', artist: '', album: '' }

const playingInfoContext = createContext<SpotifyPlayingTrack>(NULL_PLAYING_INFO)

export default function Player() {
   const [playingInfo, setPlayingInfo] = useState<SpotifyPlayingTrack>(NULL_PLAYING_INFO)
   const navigate = useNavigate()

   useEffect(() => {
      const fetchPlayingInfo = async () => {
         try {
            const info = await window.spotifyApi.getPlayingTrack()
            setPlayingInfo(info ? info : NULL_PLAYING_INFO)
         } catch (err) {
            setPlayingInfo(NULL_PLAYING_INFO)
            navigate("/error")
         }
      }

      const ival = setInterval(fetchPlayingInfo, 1000)
      return () => clearInterval(ival)
   })

   return (
      <div className="flex">
         <playingInfoContext.Provider value={playingInfo}>
            {playingInfo.albumImage ? <AlbumCover /> : <span />}
            <MediaControls />
         </playingInfoContext.Provider>
      </div>
   )
}

const MediaControls = () => {
   const MAX_H2_BEFORE_SCROLL = 17
   const MAX_H3_BEFORE_SCROLL = 31

   const playingInfo = useContext(playingInfoContext)
   const [playButton, setPlayButton] = useState<boolean>(false)

   return (
      <div className="flex flex-col h-screen w-screen items-center justify-center">
         <div className="flex justify-between items-center">
            <button className="small-control-btn text-white">
               <FontAwesomeIcon icon={faHeart} fixedWidth />
            </button>
            <div className="w-60 flex-1">
               <h2 className="font-black text-2xl text-center scroll-cont">
                  <div className={playingInfo.name.length <= MAX_H2_BEFORE_SCROLL ? '' : 'scroll-text'}>{playingInfo.name}</div>
               </h2>
               <h2 className="font-extrabold text-base text-center scroll-cont">
                  <div className={playingInfo.album.length <= MAX_H2_BEFORE_SCROLL ? '' : 'scroll-text'}>{playingInfo.album}</div>
               </h2>
               <h3 className="font-normal text-sm text-white text-center scroll-cont">
                  <div className={playingInfo.artist.length <= MAX_H3_BEFORE_SCROLL ? '' : 'scroll-text'}>{playingInfo.artist}</div>
               </h3>
            </div>
            <button className="small-control-btn text-white">
               <FontAwesomeIcon icon={faRadio} fixedWidth />
            </button>
         </div>
         <section>
            <div className="mb-5 mt-10">
               <button className="control-btn px-4 py-4 bg-transparent text-white">
                  <FontAwesomeIcon icon={faBackwardStep} size="2x" fixedWidth />
               </button>
               <button className="control-btn">
                  <FontAwesomeIcon icon={playButton ? faPlay : faPause} size="2x" fixedWidth />
               </button>
               <button className="control-btn px-4 py-4 bg-transparent text-white">
                  <FontAwesomeIcon icon={faForwardStep} size="2x" fixedWidth />
               </button>
            </div>
         </section>
         <button className="absolute right-0 bottom-0 px-1 py-1 bg-transparent text-white">
            <FontAwesomeIcon icon={faPowerOff} fixedWidth />
         </button>
         <button className="absolute right-0 top-0 px-1 py-1 bg-transparent text-white">
            <FontAwesomeIcon icon={faSpotify} fixedWidth />
         </button>
      </div>
   )
}

const AlbumCover = () => {
   const playingInfo = useContext(playingInfoContext)

   return (
      <div className="max-h-fit min-h-fit min-w-fit">
         <img alt="cover" src={playingInfo.albumImage?.url} className="h-screen" />
      </div>
   )
}
