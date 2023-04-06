import { useContext } from 'react'
import { PlayerContext } from './Player'

export default function AlbumCover() {
   const playerProps = useContext(PlayerContext)

   if (!playerProps.albumImage) return <></>

   return (
      <div className="max-h-fit min-h-fit min-w-fit">
         <img alt="cover" src={playerProps.albumImage} className="h-screen" />
      </div>
   )
}
