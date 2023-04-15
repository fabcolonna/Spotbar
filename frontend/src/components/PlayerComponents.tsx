import {
   faBackwardStep,
   faForwardStep,
   faHeart,
   faLaptop,
   faPause,
   faPlay,
   faPowerOff,
   faSignOut
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpotify } from '@fortawesome/free-brands-svg-icons'
import { nullPlayback, playerContext } from './Player'
import { useContext } from 'react'
import { motion } from 'framer-motion'

export function AlbumArt(props: { art: Spotify.Image }) {
   return (
      <motion.div
         className='flex-1 max-h-fit min-h-fit min-w-fit max-w-fit scale-[0.8] shadow-2xl rounded-full shadow-gray-900 z-20 album-img'
         initial={{ opacity: 0, x: '100%' }}
         animate={{ opacity: 1, x: '0%', transition: { type: 'spring', stiffness: 70, damping: 15 } }}
         exit={{ opacity: 0, x: '100%', transition: { ease: 'easeIn' } }}
      >
         <motion.img
            alt='cover'
            src={props.art.url}
            className='h-screen rounded-full shadow-2x shadow-gray-600'
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} />
      </motion.div>
   )
}

export function PlaybackControls() {
   const info = useContext(playerContext)

   const addToFavorites = () => {}

   const openSpotifyConnect = () => {}

   const backwardsPlayback = () => {}

   const playPausePlayback = () => {}

   const forwardsPlayback = () => {}

   const logout = () => {}

   const quit = () => {}

   return (
      <motion.div className={`flex-1 flex flex-col h-screen items-center justify-center ${info !== nullPlayback ? 'w-fit' : 'w-screen'}`}
                  initial={{ opacity: 0, scale: 0.5, x: '0%' }}
                  animate={
                     info !== nullPlayback
                        ? { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 70, damping: 15 } }
                        : { x: '0%', transition: { ease: 'easeIn' } }
                  }
                  exit={{ opacity: 0, scale: 0.5, x: '0%', transition: { ease: 'easeIn' } }}
      >
         <div className='flex justify-between items-center'>
            <button className='small-control-btn text-white' onClick={addToFavorites}>
               <FontAwesomeIcon icon={faHeart} fixedWidth />
            </button>

            <TextualInfo />

            <button className='small-control-btn text-white'>
               <FontAwesomeIcon icon={faLaptop} fixedWidth onClick={openSpotifyConnect}/>
            </button>
         </div>

         <section>
            <div className='mb-5 mt-10'>
               <button className='control-btn px-4 py-4 bg-transparent text-white'>
                  <FontAwesomeIcon icon={faBackwardStep} size='2x' fixedWidth onClick={backwardsPlayback} />
               </button>

               <button className='control-btn'>
                  <FontAwesomeIcon icon={info.playing ? faPlay : faPause} size='2x' fixedWidth onClick={playPausePlayback} />
               </button>

               <button className='control-btn px-4 py-4 bg-transparent text-white' onClick={forwardsPlayback}>
                  <FontAwesomeIcon icon={faForwardStep} size='2x' fixedWidth/>
               </button>
            </div>
         </section>

         <button className='absolute right-0 bottom-0 px-1 py-1 bg-transparent text-white'>
            <FontAwesomeIcon icon={faSignOut} fixedWidth onClick={logout}/>
         </button>

         <button className='absolute right-0 top-0 px-1 py-1 bg-transparent text-white' onClick={quit}>
            <FontAwesomeIcon icon={faPowerOff} fixedWidth/>
         </button>
      </motion.div>
   )
}

function TextualInfo() {
   const info = useContext(playerContext)

   return (
      <div className='w-60 flex-1'>
         <h3 className='font-semibold text-sm text-white text-center mb-2'>
            {info !== nullPlayback && <div>Listening on <b>{info.device.name}</b></div>}
         </h3>
         <h2 className='font-black text-2xl text-center scroll-cont'>
            <div>{info.track.title}</div>
         </h2>
         <h2 className='font-extrabold text-base text-center scroll-cont'>
            <div>{info.track.album}</div>
         </h2>
         <h3 className='font-normal text-sm text-white text-center scroll-cont'>
            <div>{info.track.artists}</div>
         </h3>
      </div>
   )
}


