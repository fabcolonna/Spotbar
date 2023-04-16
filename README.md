<p>
  <img src="assets/readme/big_color_icon.png" alt="Spotbar Icon"/>
</p>

# **Spotbar**

Spotbar is a cute little app that runs in the macOS menu bar (Windows/Linux support may be present, but I haven't had a chance to test it out yet and I'm not fully focusing on the code that is necessary to make the app working correctly on those OSes), that offers media controls (back, play/pause, forward), album art, track info, and the ability to interact with the Spotify Connect (so you'll be able to send audio streaming to other available devices directly in the widget). I'm also considering adding a spectrum analyzer in the background for no particular reason other than aesthetics 🎶, but that's not a priority.

The idea behind all this is not having to open Spotify app for such basic actions. I know there are many alternatives, but this one could be potentially quite convenient IMO.

<p>
  <img src="assets/readme/spotbar.png" alt="Spotbar Screenshot"/>
</p>

## Getting Started

The app requires `node.js`. Make sure to have it installed before proceeding, by typing `node --version` in your terminal. Install it on your machine if you don't have it by visiting [the official website](https://nodejs.org/it/download/), or by using the `brew` package manager for macOS.

The node package manager `npm` is also required. If you grabbed the installer from the node website then it should be already present in your system. Make sure it's installed by typing `npm --version`. Installing it should be pretty straight-forward.

## Installing

Before starting, install `yarn` with the command `npm install --global yarn`. Then clone this repo and install the required modules:

```
git clone https://github.com/levarr/Spotbar
cd Spotbar
yarn install
```

As of now, the backend and frontend parts have different `package.json` files, and it is necessary to cd in each of them in order to install their dependencies:

```
cd backend && yarn install && cd ..
cd frontend && yarn install && cd ..
```

You should now be back in the root directory. In here, run `yarn dev` to run the app. But **NOT** before you read the rest of this file!

## Spotify API

This app relies on Spotify API. Rather than building my own library to interact with them, Spotbar relies on an amazing open source library named [`spotify-web-api-node`](https://github.com/thelinmichael/spotify-web-api-node) offered by [Michael Thelin aka. @thelinmicheael](https://github.com/thelinmichael).

Currently, in order to use Spotbar, you have to create your personal *client_id* and *client_secret* by logging into the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/). Once you have them, you can setup your `.env` file in the root directory using the reference `.env.example` file provided. After that, you should be good to go. Note that this procedure is not the permanent way: I'm thinking about various solutions, that will be implemented only when i feel like Spotbar is ready.

## Built With

* [Electron.js](https://www.electronjs.org/) - Backend (i.e. App window + IPC Handler for Spotify API calls made @ the frontend)
* [React.js](https://reactjs.org/) - Frontend
* [TailwindCSS](https://tailwindcss.com/) - CSS utility framework, together with PostCSS

## Contributing

*Work in progress!*

## Authors

* **Fabio Colonna** - *Initial work* - [levarr](https://github.com/levarr)

I look forward to adding somone else in here, in the future!

## License

*Work in progress!*
