import express, { Application } from 'express'
import * as http from 'http'

export default class SpotifyRedirectServer {
   private static readonly HTML_RESPONSES = {
      success: `
         <!DOCTYPE html>
         <html><body><h1>Spotify Authorization Success!</h1></body>
         </html>
      `,
      failure: `
         <!DOCTYPE html>
         <html><body><h1>Error while trying to login to Spotbar</h1></body>
         </html>
      `
   }

   private readonly endPoint: string
   private readonly port: number
   private readonly exp: Application

   private expServer?: http.Server
   private isListening: boolean = false

   constructor(endpointName: string, port: number) {
      this.exp = express()

      if (endpointName.length < 2) throw new Error('Invalid server endpoint: ' + endpointName)
      if (port <= 0) throw new Error('Invalid port: ' + port)

      this.endPoint = (endpointName[0] !== '/' ? '/' : '') + endpointName
      this.port = port
   }

   public getAuthorizationCode = (): Promise<string> => {
      if (this.isListening) return Promise.reject('Server is already listening. Cannot proceed')

      let responseRef: any
      const promise = new Promise<string>((res, _) => (responseRef = res))

      this.exp.get(this.endPoint, (req, resp) => {
         try {
            const code = req.query.code || undefined
            resp.send(SpotifyRedirectServer.HTML_RESPONSES.success)
            responseRef(code)
         } catch (err) {
            resp.send(SpotifyRedirectServer.HTML_RESPONSES.failure)
         } finally {
            this.expServer!.close(() => (this.isListening = false)) // If we're running this server is defined for sure
         } // Server stops after request
      })

      this.expServer = this.exp.listen(this.port)
      this.isListening = true
      return promise
   }
}
