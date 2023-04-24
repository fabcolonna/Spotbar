import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpotify } from '@fortawesome/free-brands-svg-icons'
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function Login(props: { onLogin: () => void }) {
  const [inputOff, setInputOff] = useState(false)

  const login = () => {
    setInputOff(true)
    props.onLogin()
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 70, damping: 15 } }}
      exit={{ opacity: 0, scale: 0.5, transition: { ease: 'easeIn' } }}>
      <section className="login-sec">
        <div className="mb-2">
          <h1 className="font-black text-3xl">Welcome to Spotbar!</h1>
        </div>

        <div className="mt-2">
          <button disabled={inputOff} className="login-btn" onClick={login}>
            <FontAwesomeIcon icon={faSpotify} size="2x" fixedWidth className="mr-2 inline-block" />
            <span className="inline-block pr-1">Login with Spotify...</span>
          </button>
        </div>
      </section>
    </motion.div>
  )
}
