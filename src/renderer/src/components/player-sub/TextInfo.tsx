import { isUnsetted } from '@renderer/playback-info-state/pb-state'
import { RootState } from '@renderer/playback-info-state/pb-store'
import { useSelector } from 'react-redux'

export default function TextInfo(props: { fullWidth: boolean }) {
  const pbInfo = useSelector((state: RootState) => state.playback)
  const isPbUnsetted = useSelector(isUnsetted)

  return (
    <div className={`flex-1 ${props.fullWidth ? 'w-full' : 'w-60'}`}>
      <h3 className="font-semibold text-sm text-white text-center mb-2">
        {!isPbUnsetted && (
          <div>
            Listening on <b>{pbInfo.device.name}</b>
          </div>
        )}
      </h3>
      <h2 className="font-black text-2xl text-center scroll-cont">
        <div>{pbInfo.track.title}</div>
      </h2>
      <h2 className="font-extrabold text-base text-center scroll-cont">
        <div>{pbInfo.track.album}</div>
      </h2>
      <h3 className="font-normal text-sm text-white text-center scroll-cont">
        <div>{pbInfo.track.artists}</div>
      </h3>
    </div>
  )
}
