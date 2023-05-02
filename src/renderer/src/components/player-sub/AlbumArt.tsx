import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { RootState } from '@renderer/playback-info-state/pb-store'

export default function AlbumArt() {
  // If AlbumArt is rendered, pbAlbumArt is defined for sure, thus !
  const pbAlbumArt = useSelector((state: RootState) => state.playback.track.albumArt!)

  const [key, setKey] = useState<string>(pbAlbumArt.url)
  const [stopAnimation, setStopAnimation] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setKey(pbAlbumArt.url) // Key changes after 500ms the real change happened, exit animation can start
      setStopAnimation(false) // Animation can resume
    }, 500)

    setStopAnimation(true)
  }, [pbAlbumArt.url])

  return (
    <motion.div
      key={key}
      className="flex-1 max-h-fit min-h-fit min-w-fit max-w-fit shadow-2xl rounded-full shadow-gray-900 z-20"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={
        stopAnimation
          ? { opacity: 0, scale: 0.5, transition: { ease: 'easeIn', duration: 0.5 } }
          : { opacity: 1, scale: 0.8, transition: { type: 'spring', damping: 4, stiffness: 30 } }
      }
    >
      <motion.img
        alt="cover"
        src={key}
        className="h-screen rounded-full shadow-2x shadow-gray-600"
        animate={{ rotate: 360, transition: { duration: 5, repeat: Infinity, ease: 'linear' } }}
      />
    </motion.div>
  )
}
