import { motion } from 'framer-motion'
import { useContext, useEffect, useRef, useState } from 'react'
import { pbContext } from './Player'
import { extractColorsFromSrc } from 'extract-colors'

export default function AlbumCover() {
   const info = useContext(pbContext)
   const [swatch, setSwatch] = useState<string[]>([])
   const prevImage = useRef<string>('')

   const randomColor = () => {
      const i = Math.floor(Math.random() * swatch.length)
      return swatch[i]
   }

   const initGradient = {
      background: `linear-gradient(90deg, ${randomColor()}, ${randomColor()})`
   }

   const finalGradient = {
      background: `linear-gradient(90deg, ${randomColor()}, ${randomColor()})`
   }

   useEffect(() => {
      if (prevImage.current === info.track.albumImage!.url) return

      extractColorsFromSrc(info.track.albumImage!.url, { crossOrigin: 'anonymous' })
         .then(data => {
            setSwatch(
               data
                  .filter(color => {
                     return color.lightness < 0.4
                  })
                  .map(color => color.hex)
            )
            prevImage.current = info.track.albumImage!.url // Colors set up, don't need to run this again
         })
         .catch(() => setSwatch([]))
   }, [info.track.albumImage, prevImage, swatch])


   // STOP ANIMATION IF PAUSED
   return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ ease: 'easeInOut' }}>
         <motion.div className="w-screen h-screen music-album-div" style={initGradient} animate={finalGradient} transition={{ duration: 10, repeat: Infinity }}>
            <div className="max-h-fit min-h-fit min-w-fit scale-[0.8] -ml-10">
               <motion.img alt="cover" src={info.track.albumImage!.url} className="h-screen rounded-full shadow-2xl" initial={{ rotate: 0 }} 
                  animate={ info.isPlaying && { rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} />
            </div>
         </motion.div>
      </motion.div>
   )
}
