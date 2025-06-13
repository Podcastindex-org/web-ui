const path = require('path')
const fs = require('fs')
const express = require('express')
const app = express() // create express app
const {
  makeThreadcap,
  InMemoryCache,
  updateThreadcap,
  makeRateLimitedFetcher,
} = require('threadcap')
const fetch = require('node-fetch')
const packageJson = require('../package.json')
const ejs = require('ejs')

// Gets the .env variables
require('dotenv').config()

const USER_AGENT = `Podcastindex.org-web/${packageJson.version}`

// Utilizing the node repo from comster/podcast-index-api :)
// NOTE: This server will work as a reverse proxy.
const api = require('podcast-index-api')(
  process.env.API_KEY,
  process.env.API_SECRET,
  process.env.API_USER_AGENT
)

const apiAdd = require('podcast-index-api')(
  process.env.API_ADD_KEY,
  process.env.API_ADD_SECRET,
  process.env.API_USER_AGENT
)

app.set('view engine', 'ejs')
app.set('views', './server/views')

app.use((req, res, next) => {
  const { rawHeaders, httpVersion, method, socket, url } = req
  const { remoteAddress, remoteFamily } = socket

  // console.log(
  //     JSON.stringify({
  //         timestamp: Date.now(),
  //         rawHeaders,
  //         httpVersion,
  //         method,
  //         remoteAddress,
  //         remoteFamily,
  //         url
  //     })
  // );

  let userAgent = req.header('user-agent')
  let cfLocation = req.header('CF-IPCountry')
  let cfSourceIP = req.header('CF-Connecting-IP')
  let cfBotScore = req.header('Cf-Bot-Score')

  var logString =
    '[' +
    Date.now() +
    '] ' +
    '[' +
    remoteAddress +
    '] ' +
    method +
    ' (' +
    url +
    ') - UA: [' +
    userAgent +
    '] - LOC: [' +
    cfLocation +
    '|' +
    cfSourceIP +
    '] - BOT: [' +
    cfBotScore +
    ']'

  console.log(logString)

  next()
})

// ------------------------------------------------
// ---------- Static files for namespace ----------
// ------------------------------------------------

app.use('/namespace/1.0', async (req, res) => {
  res.redirect(
    'https://github.com/Podcastindex-org/podcast-namespace/blob/main/docs/1.0.md'
  )
})

// ------------------------------------------------
// ------------ Reverse proxy for API -------------
// ------------------------------------------------

app.use('/api/search/byterm', async (req, res) => {
  const response = await api.custom('search/byterm', req.query)
  res.send(response)
})

app.use('/api/search/bytitle', async (req, res) => {
  let term = req.query.q
  const response = await api.custom('search/bytitle', { q: term })
  res.send(response)
})

app.use('/api/search/music/byterm', async (req, res) => {
  let term = req.query.q
  const response = await api.custom('search/music/byterm', { q: term })
  res.send(response)
})

app.use('/api/search/byperson', async (req, res) => {
  let person = req.query.q
  const response = await api.searchEpisodesByPerson(person)
  res.send(response)
})

app.use('/api/recent/episodes', async (req, res) => {
  let max = req.query.max
  const response = await api.recentEpisodes(max)
  res.send(response)
})

app.use('/api/podcasts/bytag', async (req, res) => {
  let max = req.query.max
  let start_at = req.query.start_at
  const response = await api.custom('podcasts/bytag', {
    'podcast-value': '',
    max: max,
    start_at: start_at,
  })
  res.send(response)
})

app.use('/api/podcasts/byfeedid', async (req, res) => {
  let feedId = req.query.id
  const response = await api.podcastsByFeedId(feedId)
  res.send(response)
})

app.use('/api/podcasts/byguid', async (req, res) => {
  let guid = req.query.guid
  const response = await api.custom('podcasts/byguid', { guid: guid })
  res.send(response)
})

app.use('/api/podcasts/byfeedurl', async (req, res) => {
  let feedUrl = req.query.url
  const response = await api.podcastsByFeedUrl(feedUrl)
  res.send(response)
})

app.use('/api/episodes/byfeedid', async (req, res) => {
  let feedId = req.query.id
  let max = req.query.max
  const response = await api.episodesByFeedId(feedId, null, max)
  res.send(response)
})

app.use('/api/add/byfeedurl', async (req, res) => {
  let feedUrl = req.query.url
  const response = await apiAdd.addByFeedUrl(feedUrl)
  res.send(response)
})

// ------------------------------------------------
// ------------ API to get comments for episode ---
// ------------------------------------------------
app.use('/api/comments/byepisodeid', async (req, res) => {
  let episodeId = req.query.id
  const response = await api.episodesById(episodeId, false)

  const socialInteract =
    response.episode.socialInteract &&
    response.episode.socialInteract.filter(
      (si) => si.protocol === 'activitypub'
    )

  if (socialInteract === undefined || socialInteract.length === 0) {
    // Bad requests sounds appropriate, as the client is only expected to call this API
    // when it validated upfront that the episode has a property socialInteract with activitypub protocol
    res
      .status(400)
      .send('The episode does not contain a socialInteract property')
    return
  }

  const userAgent = USER_AGENT
  const cache = new InMemoryCache()
  const fetcher = makeRateLimitedFetcher(fetch)

  // Disable buffering in the nginx server so that the delivery of
  // chunks are not delayed
  res.setHeader('X-Accel-Buffering', 'no')

  const sentCommenters = {}

  const threadcap = await makeThreadcap(socialInteract[0].uri, {
    userAgent,
    cache,
    fetcher,
  })

  const callbacks = {
    onEvent: (e) => {
      if (e.kind === 'node-processed' && e.part === 'replies') {
        writeThreadcapChunk(e.nodeId, threadcap, sentCommenters, res)
      }
    },
  }

  await updateThreadcap(threadcap, {
    updateTime: new Date().toISOString(),
    userAgent,
    cache,
    fetcher,
    callbacks,
  })

  res.end()
})

function writeThreadcapChunk(processedNodeId, threadcap, sentCommenters, res) {
  const threadcapChunk = {}

  threadcapChunk.roots = threadcap.roots.filter(
    (root) => root === processedNodeId
  )
  threadcapChunk.nodes = {}
  threadcapChunk.nodes[processedNodeId] = threadcap.nodes[processedNodeId]

  const comment = threadcapChunk.nodes[processedNodeId].comment

  // nodes are always new, but commenters can be repeated, we only include
  // them in th chunk if they have not been sent before, as there is no purpose
  // on sending them again.
  // this could be determines by inspecting previous nodes, but this way
  // is easier.
  if (comment && !sentCommenters[comment.attributedTo]) {
    sentCommenters[comment.attributedTo] = true
    threadcapChunk.commenters = {}
    threadcapChunk.commenters[comment.attributedTo] =
      threadcap.commenters[comment.attributedTo]
  }

  res.write(JSON.stringify(threadcapChunk) + '\n')
}

// ---------------------------------------------------------
// --------- API to get remote interact url for comments ---
// ---------------------------------------------------------
app.use('/api/comments/remoteInteractUrlPattern', async (req, res) => {
  const interactorAccount = req.query.interactorAccount

  console.log('Debug interactorAccount', interactorAccount)

  let splitIndex = 1
  if (interactorAccount.startsWith('@')) {
    splitIndex = 2
  }
  const interactorInstanceHost = interactorAccount.split('@')[splitIndex]

  const response = await fetch(
    `https://${interactorInstanceHost}/.well-known/webfinger?` +
      new URLSearchParams({
        resource: `acct:${interactorAccount.substring(splitIndex - 1)}`,
      })
  )
  const parsedResponse = await response.json()

  const linkOStatusSubscribe = parsedResponse.links.find(
    (link) => link.rel === 'http://ostatus.org/schema/1.0/subscribe'
  )

  res.send({
    remoteInteractUrlPattern: linkOStatusSubscribe.template,
  })
})

// ------------------------------------------------
// ---------- Static files for API data -----------
// ------------------------------------------------

app.use('/api/stats', async (req, res) => {
  fs.readFile('./server/data/stats.json', 'utf8', (err, data) => {
    // You should always specify the content type header,
    // when you don't use 'res.json' for sending JSON.
    res.set('Content-Type', 'application/json')
    res.send(data)
  })
})

app.use('/api/newfeedstats', async (req, res) => {
  fs.readFile('./server/data/newfeedstats.json', 'utf8', (err, data) => {
    // You should always specify the content type header,
    // when you don't use 'res.json' for sending JSON.
    res.set('Content-Type', 'application/json')
    res.send(data)
  })
})

app.use('/api/apps', async (req, res) => {
  fs.readFile('./server/data/apps.json', 'utf8', (err, data) => {
    // You should always specify the content type header,
    // when you don't use 'res.json' for sending JSON.
    res.set('Content-Type', 'application/json')
    res.send(data)
  })
})

app.use('/api/images', express.static('./server/assets'))

// ------------------------------------------------
// ---------- Pages with Open Graph tags ----------
// ------------------------------------------------

app.use('/apps', (req, res) => {
  res.render('index', {
    title: 'Apps',
    path: req.originalUrl,
  })
})

app.use('/add', (req, res) => {
  res.render('index', {
    title: 'Add Feed',
    path: req.originalUrl,
  })
})

app.use('/podcast/value4value', (req, res) => {
  res.render('index', {
    title: 'Value 4 Value Podcasts',
    description:
      'These podcasts are set up to receive Bitcoin payments in real-time over the Lightning network using compatible Podcasting 2.0 apps.',
    path: req.originalUrl,
  })
})

app.use('/podcast/:podcastid(\\d+)', async (req, res) => {
  const params = {
    title: 'Podcast', // default title
    path: req.originalUrl,
  }

  if (req.query.episode) {
    // /podcast/41504?episode=15576217793
    const response = await api.episodesById(req.query.episode)

    if (response?.episode?.id) {
      const { feedTitle, title, description, image } = response.episode
      const textDescription = description
        .replace(new RegExp('</?[^>]+(>|$)', 'gi'), '')
        .replace(new RegExp('[\r\n]', 'g'), ' ')

      params.title = feedTitle + ' | ' + title
      params.description = textDescription
      params.image = image
    }
  } else if (req.params.podcastid) {
    // /podcast/41504
    const response = await api.podcastsByFeedId(req.params.podcastid)

    if (response?.feed?.id) {
      const { title, description, image } = response.feed
      const textDescription = description
        .replace(new RegExp('</?[^>]+(>|$)', 'gi'), '')
        .replace(new RegExp('[\r\n]', 'g'), ' ')

      params.title = title
      params.description = textDescription
      params.image = image
    }
  }

  res.render('index', params)
})

app.use('/search', (req, res) => {
  res.render('index', {
    title: 'Search',
    path: req.originalUrl,
  })
})

app.use('/stats', (req, res) => {
  res.render('index', {
    title: 'Stats',
    path: req.originalUrl,
  })
})

// ------------------------------------------------
// ---------- Static content for client -----------
// ------------------------------------------------

app.use(express.static('./server/www'))

app.get('*', (req, res) => {
  res.render('index', {})
})

// ------------------------------------------------

const PORT = process.env.PORT || 333

// start express server on port 5001 (default)
app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`)
})
