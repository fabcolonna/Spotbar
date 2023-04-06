import express, { Application } from 'express'
import * as http from 'http'

export default class SpotifyRedirectServer {
   private static HTML_RESPONSES = {
      success: `
         <!DOCTYPE html>
         <html>
            <head>
            <meta charset="UTF-8">
            <title>Spotify Authorization Success</title>
            </head>
            <body>
            <h1>Spotify Authorization Success!</h1>
            <p>You can now close this window and return to the application.</p>
            </body>
         </html>
      `,
      failure: `
         <!DOCTYPE html>
         <html>
            <head>
            <meta charset="UTF-8">
            <title>Spotify Authorization Success</title>
            </head>
            <body>
            <h1>Error while trying to login to Spotbar</h1>
            <p>Close this page and try again</p>
            </body>
         </html>
      `
   }

   private readonly _endpointName: string
   private readonly _port: number
   private readonly _express: Application

   private _server?: http.Server
   private _isListening: boolean = false

   constructor(endpointName: string, port: number) {
      this._express = express()

      if (endpointName.length < 2) throw new Error('Invalid server endpoint: ' + endpointName)

      this._endpointName = (endpointName[0] !== '/' ? '/' : '') + endpointName

      if (port <= 0) throw new Error('Invalid port: ' + port)

      this._port = port
   }

   public getAuthorizationCode = (): Promise<string> => {
      if (this._isListening) throw new Error('Server is already listening. Cannot proceed')

      let responseRef: any
      const promise = new Promise<string>((res, _) => (responseRef = res))

      this._express.get(this._endpointName, (req, resp) => {
         try {
            const code = req.query.code || undefined
            resp.send(SpotifyRedirectServer.HTML_RESPONSES.success)
            responseRef(code)
         } catch (err) {
            resp.send(SpotifyRedirectServer.HTML_RESPONSES.failure)
         } finally {
            this._server!.close(() => (this._isListening = false)) // If we're running this server is defined for sure
         } // Server stops after request
      })

      this._server = this._express.listen(this._port)
      this._isListening = true
      return promise
   }
}
