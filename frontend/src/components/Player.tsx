import { createContext } from "react";
//import AlbumCover from "./player/AlbumCover";
//import MediaControls from "./player/MediaControls";

interface PlayerProps {
   userName?: string,
   userImage?: string,

   title?: string;
   album?: string;
   albumImage?: string;
   artist?: string;
}

export const PlayerContext = createContext<PlayerProps>({});

export default function Player(props: PlayerProps) {
   return (
      <div className="flex">
         <PlayerContext.Provider value={props}>
            <h1>Welcome, {props.userName}!</h1>
         </PlayerContext.Provider>
      </div>
   );
}