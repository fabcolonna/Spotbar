import { motion } from 'framer-motion'

export default function Spinner() {
   return (
      <motion.div initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 70, damping: 15 } }}
                  exit={{ opacity: 0, scale: 0.5, transition: { ease: 'easeIn' } }}
      >
      </motion.div>
   )
}
