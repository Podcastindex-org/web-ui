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

TODO

## TODO

-   Font should load through webpack properly
-   Better image loading handling in the search results page.
-   reverse proxy server built for API_KEY and what not... this should not happen in the react code.
-   Mobile responsive search results
