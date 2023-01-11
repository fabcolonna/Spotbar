import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';

interface LoginProps {
   loginClickHandler: () => any;
}

export default function Login(props: LoginProps) {
   return (
      <section className="login-sec">
         <div className="mb-2">
            <h1 className="font-black text-3xl">
               Welcome to Spotbar!
            </h1>
         </div>
         <div className="mt-2">
            <button className="login-btn" onClick={props.loginClickHandler}>
               <FontAwesomeIcon icon={faSpotify} size="2x" fixedWidth className="mr-2 inline-block" />
               <span className="inline-block">Login with Spotify...</span>
            </button>
         </div>
      </section>
   );
}