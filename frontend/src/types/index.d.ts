export {}

declare global {
   interface Window {
      api: {
         login: (args?: any[]) => number;
      }
   }
}