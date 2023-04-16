import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function AlbumArt(props: { art: Spotify.Image }) {
   const [key, setKey] = useState<string>(props.art.url)
   const [stopAnimation, setStopAnimation] = useState(false)

   useEffect(() => {
      console.log('Waiting before album image switch...')

      setTimeout(() => {
         setKey(props.art.url) // Key changes after 500ms the real change happened, exit animation can start
         setStopAnimation(false) // Animation can resume
         console.log('Image switched')
      }, 500)

      setStopAnimation(true)
   }, [props.art.url])

   return (
      <motion.div
         key={key}
         className='flex-1 max-h-fit min-h-fit min-w-fit max-w-fit shadow-2xl rounded-full shadow-gray-900 z-20'
         initial={{ opacity: 0, scale: 0.5}}
         animate={stopAnimation ? { opacity: 0, scale: 0.5, transition: { ease: 'easeIn', duration: 0.5 } } : { opacity: 1, scale: 0.8, transition: { type: 'spring', damping: 4, stiffness: 30 } }}
      >
         <motion.img
            alt='cover'
            src={key}
            className='h-screen rounded-full shadow-2x shadow-gray-600'
            animate={{ rotate: 360, transition: { duration: 5, repeat: Infinity, ease: 'linear' }}} />
      </motion.div>
   )
}