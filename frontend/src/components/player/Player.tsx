import { createContext } from 'react'

interface PlayerProps {
   name: string
   image?: Image

   title?: string
   album?: string
   artist?: string

   albumImage?: string
}

export const PlayerContext = createContext<PlayerProps>({ name: "" })

export default function Player(props: PlayerProps) {
   return (
      <div className="flex">
         <PlayerContext.Provider value={props}>
         </PlayerContext.Provider>
      </div>
   )
}
