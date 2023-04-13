import { faSpotify } from '@fortawesome/free-brands-svg-icons'
import { faBackwardStep, faForwardStep, faHeart, faPause, faPlay, faPowerOff, faRadio } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useContext, useState } from 'react'
import { pbContext } from './Player'

export function Controls() {
   //const MAX_H2_BEFORE_SCROLL = 17
   //const MAX_H3_BEFORE_SCROLL = 31

   const info = useContext(pbContext)
   const [playButton, setPlayButton] = useState<boolean>(false)

   return (
      <div className="flex flex-col h-screen w-screen items-center justify-center bg-transparent">
         <div className="flex justify-between items-center bg-transparent">
            <button className="small-control-btn text-white">
               <FontAwesomeIcon icon={faHeart} fixedWidth />
            </button>
            <div className="w-60 flex-1">
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
