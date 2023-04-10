import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'

export default function Error() {
   const { message } = useParams()
   const navigate = useNavigate()

   return (
      <motion.div
         initial={{ opacity: 0, x: '100%' }}
         animate={{ opacity: 1, x: '0%', transition: { type: 'spring', stiffness: 70, damping: 15 } }}
         exit={{ opacity: 0, transition: { ease: 'easeIn' } }}
      >
         <section className="login-sec">
            <div className="mb-2">
               <h1 className="font-black text-3xl">Ops! Something went wrong 🤕</h1>
            </div>
            <div className="mb-2">
               <h4 className="font-semibold text-center pr-10 pl-10 text-white">{message || "No details available"}</h4>
            </div>
            <div className="mt-2">
               <button className="login-btn" onClick={() => navigate(-1)}>
                  <span className="inline-block pr-1">Okay, bring me back</span>
               </button>
            </div>
         </section>
      </motion.div>
   )
}
