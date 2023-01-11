# Spotbar

Spotbar aims to be a small app that runs in macOS menu bar or Windows taskbar (Linux support may be present, but I haven't had a chance to test it out yet, so things are not guaranteed to work), that offers media controls (still very basic AND not working *at all* 🌞) and current song informations, such as title, artist, and album.

The idea is not having to open Spotify app for everything (quick search an exact song and playing it, controlling playback and checking song infos).

## Getting Started

The app requires `node.js`. Make sure to have it installed before proceeding, by typing `node --version` in your terminal. Grab a copy if you don't have it by visiting [the official website](https://nodejs.org/it/download/), or using your favourite package manager (eg. `brew` on macOS, `apt/rpm/pacman` on Linux).

The node package manager `npm` is also required. If you grabbed the installer from the node website then it should be already present in your system. Make sure it's installed by typing `npm --version`.

### Installing

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

You should now be back in the root directory. In here, run `yarn dev` to run the app.

### Spotify API

This app relies on Spotify API. By logging into the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/) you can get the authentication details that this app requires (Client ID & Client SECRET). Setup your `.env` file in the `backend/` directory using the `.env.example` file provided, and you should be good to go.

## Built With

* [Electron.js](https://www.electronjs.org/) - Backend
* [React](https://reactjs.org/) - Frontend
* [TailwindCSS](https://tailwindcss.com/) - CSS utility framework

## Contributing

*Work in progress!*

## Authors

* **Fabio Colonna** - *Initial work* - [levarr](https://github.com/levarr)

I look forward to adding somone else in here, in the future!

## License

*Work in progress!*
