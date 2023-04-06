import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'

interface UserProps {
   name: string
   image?: Image
}

export default function UserArea(props: UserProps) {
   return (
      <section className="login-sec">
         {props.image === undefined ? (
            <span />
         ) : (
            <div className="w-24 h-24 mb-3">
               <img className="rounded-full" src={props.image.url} alt="Profile pic" height={props.image.height} width={props.image.width}></img>
            </div>
         )}
         <div className="mb-2">
            <h1 className="font-black text-3xl">Welcome back, {props.name}!</h1>
         </div>
         <button className="login-btn-smaller mt-1">
            <FontAwesomeIcon icon={faArrowRight} size="1x" fixedWidth className="inline-block" />
         </button>
      </section>
   )
}
