import { faPlay, faSignOut } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

interface Props extends SpotifyMe {
   onLogout: () => void
}

export default function Welcome(props: Props) {
   const navigate = useNavigate()

   return (
      <motion.div
         initial={{ opacity: 0, x: '100%' }}
         animate={{ opacity: 1, x: '0%', transition: { type: 'spring', stiffness: 70, damping: 15 } }}
         exit={{ opacity: 0, transition: { ease: 'easeIn' } }}
      >
         <section className="login-sec">
            {!props.image ? <span /> : (
               <motion.div
                  className="w-24 h-24 mb-3"
                  initial={{ opacity: 0, x: '100%', rotate: -270 }}
                  animate={{ opacity: 1, x: '0%', rotate: 0, transition: { type: 'spring', stiffness: 70, damping: 15 } }}
                  exit={{ opacity: 0, transition: { type: 'just' } }}
               >
                  <img className="rounded-full" src={props.image.url} alt="Profile pic" height={props.image.height} width={props.image.width} />
               </motion.div>
            )}
            <div className="mb-2">
               <h1 className="font-black text-3xl">Welcome back, {props.name}!</h1>
            </div>
            <div className="mt-1">
               <button className="login-btn-smaller mr-2" onClick={() => props.onLogout()}>
                  <FontAwesomeIcon icon={faSignOut} size="1x" fixedWidth className="mr-2 inline-block" />
                  <span className="inline-block pr-1">Sign out</span>
               </button>
               <button className="login-btn-smaller ml-2" onClick={() => navigate('/player')}>
                  <FontAwesomeIcon icon={faPlay} size="1x" fixedWidth className="mr-2 inline-block" />
                  <span className="inline-block pr-1">Continue</span>
               </button>
            </div>
         </section>
      </motion.div>
   )
}
