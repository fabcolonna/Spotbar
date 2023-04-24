import { useContext } from 'react'
import { nullPlayback, playerContext } from '../Player'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBackwardStep, faForwardStep, faHeart, faLaptop, faPause, faPlay, faPowerOff, faSignOut } from '@fortawesome/free-solid-svg-icons'

// TODO: Progress bar and timestamps
// TODO: Animate PlaybackControls in/out

export interface ControlsEvents {
  trackSaved: boolean

  onTogglePlayback: () => void
  onSkipTrack: (which: 'previous' | 'next') => void
  onToggleSaveTrack: () => void
}

export default function PlaybackControls(props: ControlsEvents) {
  const info = useContext(playerContext)

  return (
    <motion.div
      className={`flex-1 flex flex-col h-screen -ml-3 items-center justify-center ${info !== nullPlayback ? 'w-fit' : 'w-screen'}`}
      initial={{ opacity: 0, scale: 0.5, x: '0%' }}
      animate={
        info !== nullPlayback
          ? { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 70, damping: 15 } }
          : { x: '0%', transition: { ease: 'easeIn' } }
      }
      exit={{ opacity: 0, scale: 0.5, x: '0%', transition: { ease: 'easeIn' } }}>
      <div className="flex justify-between items-center">
        <button className="small-control-btn text-white" onClick={props.onToggleSaveTrack} style={props.trackSaved ? { backgroundColor: '#1db954' } : {}}>
          <FontAwesomeIcon icon={faHeart} fixedWidth />
        </button>

        <TextualInfo />

        <button className="small-control-btn text-white">
          <FontAwesomeIcon icon={faLaptop} fixedWidth />
        </button>
      </div>

      <section>
        <div className="mb-5 mt-10">
          <button className="control-btn px-4 py-4 bg-transparent text-white">
            <FontAwesomeIcon icon={faBackwardStep} size="2x" fixedWidth onClick={() => props.onSkipTrack('previous')} />
          </button>

          <button className="control-btn">
            <FontAwesomeIcon icon={info.playing ? faPause : faPlay} size="2x" fixedWidth onClick={props.onTogglePlayback} />
          </button>

          <button className="control-btn px-4 py-4 bg-transparent text-white" onClick={() => props.onSkipTrack('next')}>
            <FontAwesomeIcon icon={faForwardStep} size="2x" fixedWidth />
          </button>
        </div>
      </section>

      <button className="absolute right-0 bottom-0 px-1 py-1 bg-transparent text-white">
        <FontAwesomeIcon icon={faSignOut} fixedWidth />
      </button>

      <button className="absolute right-0 top-0 px-1 py-1 bg-transparent text-white">
        <FontAwesomeIcon icon={faPowerOff} fixedWidth />
      </button>
    </motion.div>
  )
}

// TODO: Animate TextualInfo scroll if text is too long

function TextualInfo() {
  const info = useContext(playerContext)

  return (
    <div className="w-60 flex-1">
      <h3 className="font-semibold text-sm text-white text-center mb-2">
        {info !== nullPlayback && (
          <div>
            Listening on <b>{info.device.name}</b>
          </div>
        )}
      </h3>
      <h2 className="font-black text-2xl text-center scroll-cont">
        <div>{info.track.title}</div>
      </h2>
      <h2 className="font-extrabold text-base text-center scroll-cont">
        <div>{info.track.album}</div>
      </h2>
      <h3 className="font-normal text-sm text-white text-center scroll-cont">
        <div>{info.track.artists}</div>
      </h3>
    </div>
  )
}
