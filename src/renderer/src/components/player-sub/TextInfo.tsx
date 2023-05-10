import { isUnsetted } from '@renderer/playback-info-state/pb-state'
import { RootState } from '@renderer/playback-info-state/pb-store'
import { useSelector } from 'react-redux'

export default function TextInfo() {
  const pbInfo = useSelector((state: RootState) => state.playback)
  const isPbUnsetted = useSelector(isUnsetted)

  const titleOverflows = (): boolean => pbInfo.track.title.length >= 16

  const artistsOverflows = (): boolean => pbInfo.track.artists.length >= 32

  const albumOverflows = (): boolean => pbInfo.track.album.length >= 28

  return (
    <div className={`flex-1 ${isPbUnsetted ? 'w-80' : 'w-60'}`}>
      <h3 className="font-semibold text-sm text-white mb-2 text-center">
        {!isPbUnsetted && (
          <div>
            Listening on <b>{pbInfo.device.name}</b>
          </div>
        )}
      </h3>
      <div className={`scroll-cont ${(titleOverflows() && !isPbUnsetted) || 'justify-center flex'}`}>
        <h2 className={`font-black text-2xl ${titleOverflows() && !isPbUnsetted && 'hover:scroll-text'}`}>{pbInfo.track.title}</h2>
      </div>

      <div className={`scroll-cont ${(albumOverflows() && !isPbUnsetted) || 'justify-center flex'}`}>
        <h2 className={`font-extrabold text-base ${albumOverflows() && !isPbUnsetted && 'hover:scroll-text'}`}>{pbInfo.track.album}</h2>
      </div>

      <div className={`scroll-cont ${(artistsOverflows() && !isPbUnsetted) || 'justify-center flex'}`}>
        <h3 className={`font-normal text-sm text-white text-center ${artistsOverflows() && !isPbUnsetted && 'hover:scroll-text'}`}>{pbInfo.track.artists}</h3>
      </div>
    </div>
  )
}
