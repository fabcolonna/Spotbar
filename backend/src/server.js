require('dotenv').config();

const express = require('express')
const cors = require('cors');
const cookieParser = require('cookie-parser');
const querystring = require('querystring');
const b64 = require('nodejs-base64');
const axios = require('axios').default;

const STATE_COOKIE_KEY = 'spotify_auth_state';

const server = express().use(cors()).use(cookieParser());

/**
 * React frontend sends LOGIN request to this server, which connects to Spotify API. That one then redirects to the
 * specified REDIRECT_URI, which is the CALLBACK endpoint of this server.
 */
server.get('/login', (_, response) => {
   const state = generateRandomString(16);
   response.cookie(STATE_COOKIE_KEY, state);

   const scopes = ['streaming', 'user-read-private', 'user-read-currently-playing',
      'user-read-playback-state', 'user-modify-playback-state'];

   response.redirect(
      'https://accounts.spotify.com/authorize?' + querystring.stringify({
         response_type: 'code',
         client_id: process.env.CLIENT_ID,
         scope: scopes,
         redirect_uri: process.env.REDIRECT_URI,
         state: state
      })
   );
});

const generateRandomString = length => {
   const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

   let text = '';
   for (let i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

   return text;
};

const sendError = (response, details) => {
   response.send({'error_details': details});
}

/*
*  CALLBACK endpoint then requests tokens by calling the getToken() function, which uses Axios. Newly got token
*  is then used for successive Spotify API requests, such as the one made with the getUserInfo() function.
*  @return {Object} Logged user info (name + image)
*/
server.get('/callback', async (request, response) => {
   const code = request.query.code || null;
   const state = request.query.state || null;
   const storedState = request.cookies ? request.cookies[STATE_COOKIE_KEY] : null;
   if (state === null || state !== storedState) {
      sendError(response, "State mismatch");
      return;
   }

   response.clearCookie(STATE_COOKIE_KEY);

   const tokenData = await getToken({ refresh: false, code: code });
   if (tokenData === null) {
      sendError(response, "Token data is null");
      return;
   }

   const userData = await getUserInfo(tokenData.access_token, tokenData.token_type);
   if (userData === null) {
      sendError(response, "User data is null");
      return;
   }

   response.send({
      name: userData.display_name,
      image: userData.images[0].url
   });
});

server.get('/refresh_token', async (request, response) => {
   const refreshToken = request.query.refresh_token;
   const tokenData = await getToken({ refresh: true, token: refreshToken });
   if (tokenData === null) {
      sendError(response, "Refresh token failed");
      return;
   }

   response.send(tokenData);
});

const getToken = async ({ refresh, code, token }) => {
   if (refresh === undefined || (refresh && token === undefined) || (!refresh && code === undefined))
      return null; 

   const data = {
      grant_type: refresh ? 'refresh_token' : 'authorization_code',
      ...!refresh && { 
         redirect_uri: process.env.REDIRECT_URI,
         code: code
      },
      ...refresh && { refresh_token: token }
   };

   console.log(data);

   const result = await axios({
      method: 'post',
      responseType: 'json',
      url: 'https://accounts.spotify.com/api/token',
      headers: {
         Authorization: `Basic ${b64.base64encode(process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET)}`,
         'content-type': 'application/x-www-form-urlencoded'
      },
      data: data
   });
   return result.status === 200 ? result.data : null;
}

const getUserInfo = async (accessToken, tokenType) => {
   const result = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
         Authorization: `${tokenType} ${accessToken}`
      }
   });
   return result.status === 200 ? result.data : null;
}

console.log("[EXPRESS] Listening on port 8888");
server.listen(8888);


