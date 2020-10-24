# PodcastIndex web and dev UI

This is the UI for the public and dev portal

## Getting Started

### Set .env

You should see a `.env-example` file. Copy this and remove the `-example`. The file `.env` is ignored by GIT and is needed to set the `API_KEY` and `API_SECRET` variables

### Starting the dev server

In order to have the UI hot reload for development, we utilized `webpack-dev-server` this allows for easier debugging, etc. In order for the dev-server to connect to the API, you must first have set the `.env` file variables and have started the server with `node server.js` 

```zsh
# Install dependencies
npn install

# Start app
npm start

# Start the node server in another terminal window.
node server.js
```

## Running production

To start the server, simply run after setting the `.env` file

**Note**: Make sure to set `NODE_ENV=production` in the `.env` file

The below script will compile the code and then start the node server.

```zsh
npm run production
```

## TODO

-   Font should load through webpack properly
-   Better image loading handling in the search results page.
