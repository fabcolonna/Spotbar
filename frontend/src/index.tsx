import { StrictMode, useState } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

import Login from './components/Login'
import UserArea from './components/UserArea'
interface UserData {
   name: string
   image?: Image
}

const Spotbar = () => {
   const [auth, setAuth] = useState(false)
   const [userData, setUserData] = useState<UserData>({
      name: '',
      image: undefined
   })

   const loginWithSpotify = async () => {
      const me = await window.spotifyApi.loginGetMe()
      if (me !== null) {
         setUserData({ name: me.name, image: me.image })
         setAuth(true)
      }
   }

   return auth ? <UserArea {...userData} /> : <Login loginClickHandler={() => loginWithSpotify()} />
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
   <StrictMode>
      <Spotbar />
   </StrictMode>
)
