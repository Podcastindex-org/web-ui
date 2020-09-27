# PodcastIndex web and dev UI

This is the UI for the public and dev portal

## Getting Started

### Set .env

You should see a `.env-example` file. Copy this and remove the `-example`. The file `.env` is ignored by GIT and is needed to set the `API_KEY` and `API_SECRET` variables

### Starting the dev server

```zsh
# Install dependencies
yarn

# Start app
yarn start
```

## Building for production

To build the app for production use the following script.

```zsh
yarn build
```

This will compile the React code into static files in the `www` folder

## TODO

-   Font should load through webpack properly
-   Better image loading handling in the search results page.
-   Mobile responsive search results
