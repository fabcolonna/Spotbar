import { faBackwardStep, faForwardStep, faHeart, faPause, faPlay, faPowerOff, faSignOut } from '@fortawesome/free-solid-svg-icons'
import TextInfo from './TextInfo'
import { motion } from 'framer-motion'
import DeviceIcon from '../spotify-connect-sub/DeviceIcon'
import { useSelector } from 'react-redux'
import { RootState } from '@renderer/playback-info-state/pb-store'
import { isUnsetted } from '@renderer/playback-info-state/pb-state'
import * as Progress from '@radix-ui/react-progress'
import { IconButton } from '../../ui-elements/CustomButtons'

export type ControlsProps = {
  trackSaved: boolean
  fullWidth: boolean

  onTogglePlayback: () => void
  onSkipTrack: (which: 'previous' | 'next') => void
  onToggleSaveTrack: () => void
  onLogout: () => void
  onQuit: () => void
  onShowSpotifyConnect: () => void
}

export default function Controls(props: ControlsProps) {
  const pbInfo = useSelector((state: RootState) => state.playback)
  const unsetted = useSelector(isUnsetted) // Unstable

  if (unsetted)
    return (
      <motion.div
        className={'flex-1 flex flex-col h-screen items-center justify-center w-screen'}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 70, damping: 15 } }}
        exit={{ opacity: 0, transition: { ease: 'easeIn' } }}
      >
        <div className="flex justify-between items-center">
          <TextInfo />
        </div>

        <button
          className="small-control-btn text-white"
          onClick={props.onShowSpotifyConnect}
        >
          <DeviceIcon type={pbInfo.device.type} />
        </button>
      </motion.div>
    )

  return (
    <motion.div
      className={`flex-1 flex flex-col h-screen ${props.fullWidth ? '' : '-ml-3'} items-center justify-center ${props.fullWidth ? 'w-screen' : 'w-fit'}`}
      initial={{ opacity: 0, scale: 0.5, x: '0%' }}
      animate={!unsetted ? { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 70, damping: 15 } } : { x: '0%', transition: { ease: 'easeIn' } }}
      exit={{ opacity: 0, x: '0%', transition: { ease: 'easeIn' } }}
    >
      <div className="flex justify-between items-center mb-5 pt-10">
        <IconButton
          className="small-control-btn text-white"
          onClick={props.onToggleSaveTrack}
          style={props.trackSaved ? { backgroundColor: '#1db954' } : {}}
          iconName={faHeart}
        />

        <TextInfo />

        <button
          className="small-control-btn text-white"
          onClick={props.onShowSpotifyConnect}
        >
          <DeviceIcon type={pbInfo.device.type} />
        </button>
      </div>

      {pbInfo.track.progressPercent ? (
        <div className="w-[85%] h-full flex justify-center items-center">
          <h3 className="font-normal text-sm text-white text-center ml-1 mr-2 inline-block absolute left-6">
            <div>{pbInfo.track.progressMMSS}</div>
          </h3>
          <Progress.Root
            className="overflow-hidden rounded-full w-[75%] h-1.5 bg-opacity-50 bg-slate-900"
            style={{
              transform: 'translateZ(0)'
            }}
            value={pbInfo.track.progressPercent}
          >
            <Progress.Indicator
              className="bg-white w-full h-full transition-transform !opacity-100 duration-[1000ms] ease-in-out"
              style={{ transform: `translateX(-${100 - pbInfo.track.progressPercent}%)` }}
            />
          </Progress.Root>
          <h3 className="font-normal text-sm text-white text-center mr-1 ml-2 inline-block absolute right-6">
            <div>{pbInfo.track.durationMMSS}</div>
          </h3>
        </div>
      ) : (
        <></>
      )}

      <section className="pb-10 mt-5">
        <IconButton
          className="control-btn px-4 py-4 bg-transparent text-white"
          onClick={() => props.onSkipTrack('previous')}
          iconName={faBackwardStep}
          iconSize="2x"
        />

        <IconButton
          className="control-btn"
          onClick={props.onTogglePlayback}
          iconName={pbInfo.isPlaying ? faPause : faPlay}
          iconSize="2x"
        />

        <IconButton
          className="control-btn px-4 py-4 bg-transparent text-white"
          onClick={() => props.onSkipTrack('next')}
          iconName={faForwardStep}
          iconSize="2x"
        />
      </section>

      <IconButton
        className="absolute right-0 bottom-0 px-1 py-1 bg-transparent text-white"
        iconName={faSignOut}
        onClick={props.onLogout}
      />

      <IconButton
        className="absolute right-0 top-0 px-1 py-1 bg-transparent text-white"
        iconName={faPowerOff}
        onClick={props.onQuit}
      />
    </motion.div>
  )
}
