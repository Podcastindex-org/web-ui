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

### Summary
```bash
git clone https://github.com/Podcastindex-org/web-ui.git && cd "$(basename "$_" .git)"
cp .env-example .environments/.env.development # Generate a .env for development
cp .env-example .env # Generate a .env for yarn/npm start 
# Generate a new .env for production
sed s/NODE_ENV=development/NODE_ENV=production/ .env-example > .environments/.env.production
nvm use                                          # If you want to use .nvmrc Node.js version
corepack -v                                      # Check version and instalattion
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0         # Disable download prompt
corepack enable                                  # Enable dependency
#For node 20, or any >16 apply workaournd
node -v | grep v16 || export NODE_OPTIONS=--openssl-legacy-provider
```
### Set .env

You should see a `.env-example` file. Copy this into:
- `.env`. For `yarn start `
- `.environments/` and change the `-example` to `.development` and/or `.production`.

The files `.env*` should be on `.gitignore` and are needed to set the `API_KEY`, `API_SECRET`, `API_ADD_KEY` and `API_ADD_SECRET` variables.

### Starting the dev server

In order to have the UI hot reload for development, we utilized `webpack-dev-server` this allows for easier debugging, etc. In order for the dev-server to connect to the API, you must first have set the `.env*` file variables and have started the server with `yarn start`

```zsh
# Install dependencies
yarn install

# Start dev server
yarn run dev
# Or if you are using docker (to bind to 0.0.0.0 instead of loopback)
# yarn run dev:docker

# Start the node server in another terminal window.
yarn run start
```

## Running production

To start the server, simply run after setting the `.environments/.env.production` and `.env` files.

**Note**: Make sure to set `NODE_ENV=production` in `.env.production` and `.env` files.

The below script will compile the code and then start the node server.

```zsh
npm run build
npm start
```
Or use:
```zsh
yarn run production
```

## Tech List
- [Node.js](https://nodejs.org): ([v16.20.2](https://github.com/Marzal/web-ui/blob/master/.nvmrc))
- [Express](https://expressjs.com/)
- [React](https://react.dev/)
- [Corepack](https://github.com/nodejs/corepack)
- [Webpack](https://webpack.js.org/)
  - [webpack-dev-server](https://webpack.js.org/configuration/dev-server/)
  - [dotenv-webpack](https://webpack.js.org/plugins/environment-plugin/#dotenvplugin)

## TODO

-   Font should load through webpack properly
-   Better image loading handling in the search results page.
-   Developers page and login
