import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { RightSlideInSection } from '../ui-elements/AnimatedContainers'

export default function Error(props: { onLogout: () => void }) {
  const [inputOff, setInputOff] = useState(false)
  const { message } = useParams()

  const okay = () => {
    setInputOff(true)
    props.onLogout()
  }

  return (
    <RightSlideInSection className="login-sec">
      <div className="mb-2">
        <h1 className="font-black text-3xl">Ops! Something went wrong 🥲</h1>
      </div>

      <div className="mb-2">
        <h4 className="font-semibold text-center pr-10 pl-10 text-white">{message || ''}</h4>
      </div>

      <div className="mt-2">
        <button
          disabled={inputOff}
          className="login-btn"
          onClick={okay}
        >
          <span className="inline-block pr-1">Okay</span>
        </button>
      </div>
    </RightSlideInSection>
  )
}
