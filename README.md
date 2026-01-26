# PodcastIndex Web UI

Podcast Web UI is a project that houses the code for the React app and express server for [podcastindex.org](https://podcastindex.org/).

- Landing page for PodcastIndex.
- Search for podcasts in index.
- Simple podcast player for listening.
- List of apps using the PodcastIndex.
- Documentation and developer login for credential management.

## Project Structure

The project is split into two folders, `ui`, and `server`.

    .
    ├── ...
    ├── ui
    │   ├── public      # Static files for index.html and favicon
    │   ├── fonts       # Fonts used in the UI
    │   ├── images      # Images and icons that are part of the UI
    │   └── src         # All React and client code
    ├── server
    │   ├── assets      # static files that are dynamically updated
    │   ├── data        # static data files (ie. json) that are dynamically updated
    │   └── index.js    # express app that serves the UI and is a reverse proxy (replaces need for NGINX)
    └── ...

The folder `ui` houses all the React and client based code and assets.

The folder `server` houses all of the API, static server data, and the reverse proxy to the PodcastIndex API using [`comster/podcast-index-api`](https://github.com/comster/podcast-index-api).

### Server `data` and `assets`

The reason to build a custom express server for serving React and other data is due to the need for script updated `.json` files and dynamically adding apps to the `/apps` page. This data should not be bundled with the client compiled code.

### CORS

The custom express server also is used to [reverse proxy](https://en.wikipedia.org/wiki/Reverse_proxy) requests through the same domain to prevent [CORS](https://developer.mozilla.org/docs/Web/HTTP/Guides/CORS) issues. Using the same domain to server up the UI content and to send api requests prevents CORS issues in modern browsers.

## Getting Started

### Set .env

You should see a `.env-example` file. Copy this and remove the `-example`. The file `.env` is ignored by GIT and is needed to set the `API_KEY`, `API_SECRET`, `API_ADD_KEY` and `API_ADD_SECRET` variables

### Starting the dev server

In order to have the UI hot reload for development, we utilized `webpack-dev-server` this allows for easier debugging, etc. In order for the dev-server to connect to the API, you must first have set the `.env` file variables and have started the server with `yarn start`

```zsh
# Install dependencies
yarn install

# Start dev server
yarn dev

# Start the node server in another terminal window.
yarn start
```

## Running production

To start the server, simply run after setting the `.env` file

**Note**: Make sure to set `NODE_ENV=production` in the `.env` file

The below script will compile the code and then start the node server.

```zsh
npm run build
npm start
```

## Tech List

- [Express](https://expressjs.com/)
- [React](https://react.dev/)
- [Webpack](https://webpack.js.org/)

## TODO

-   Font should load through webpack properly
-   Better image loading handling in the search results page.
-   Developers page and login
