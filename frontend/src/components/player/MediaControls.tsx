import { useContext } from "react";
import { PlayerContext } from "../Player";

import { faBackwardStep, faPlay, faForwardStep, faHeart, faRadio, faPowerOff } from "@fortawesome/free-solid-svg-icons";
import { faSpotify } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function MediaControls() {
   const playerProps = useContext(PlayerContext);

   const title = playerProps.title || '-';
   const album = playerProps.album || '-'
   const artist = playerProps.artist || '-';

   return (
      <div className="flex flex-col h-screen w-screen items-center justify-center">
         <div className="flex">
            <button className="small-control-btn text-white" >
               <FontAwesomeIcon icon={faHeart} fixedWidth />
            </button>
            <div>
               <h2 className="font-black text-2xl break-word text-center">{title}</h2>
               <h2 className="font-extrabold text-base text-center">{album}</h2>
               <h3 className="font-normal text-sm text-white text-center">{artist}</h3>
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
               <button className="control-btn" >
                  <FontAwesomeIcon icon={faPlay} size="2x" fixedWidth />
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
   );
}
