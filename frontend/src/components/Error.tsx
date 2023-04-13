import { motion } from 'framer-motion'
import { useParams } from 'react-router-dom'

interface Props {
   onLogout: () => void
}

export default function Error(props: Props) {
   const { message } = useParams()

   return (
      <motion.div initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: '0%', transition: { type: 'spring', stiffness: 70, damping: 15 } }} exit={{ opacity: 0, transition: { ease: 'easeIn' } }}>
         <section className="login-sec">
            <div className="mb-2">
               <h1 className="font-black text-3xl">Ops! Something went wrong 🥲</h1>
            </div>
            <div className="mb-2">
               <h4 className="font-semibold text-center pr-10 pl-10 text-white">{message || ''}</h4>
            </div>
            <div className="mt-2">
               <button className="login-btn" onClick={props.onLogout}>
                  <span className="inline-block pr-1">Okay</span>
               </button>
            </div>
         </section>
      </motion.div>
   )
}
