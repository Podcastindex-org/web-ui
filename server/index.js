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
const dns = require('dns')
const https = require('https')
const net = require('net')
const fetch = require('node-fetch')
const packageJson = require('../package.json')
const ejs = require('ejs')
const { createPowMiddleware } = require('./middleware/index')

// Gets the .env variables
require('dotenv').config()

const USER_AGENT = `Podcastindex.org-web/${packageJson.version}`
const POW_DIFFICULTY = parseInt(process.env.POW_DIFFICULTY, 10) || 0;

// ---------------------------------------------------------
// --------- Hardening for fetches to untrusted hosts ------
// ---------------------------------------------------------
// Responses from remote servers are never decompressed (avoids feeding
// attacker-controlled Brotli/gzip data to zlib, see CVE-2026-111497), and
// webfinger lookups may only reach public addresses (no SSRF to localhost
// or the internal network).

// Fetcher for threadcap: same as node-fetch, but without decompression
const uncompressedFetch = (url, opts = {}) =>
  fetch(url, { ...opts, compress: false })

const blockedAddresses = new net.BlockList()
for (const [prefix, bits] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
]) {
  blockedAddresses.addSubnet(prefix, bits, 'ipv4')
}
for (const [prefix, bits] of [
  ['::', 128],
  ['::1', 128],
  // No ::ffff:0:0/96 rule: BlockList checks IPv4-mapped IPv6 addresses
  // against the IPv4 rules above, and that rule would match every IPv4 address
  ['64:ff9b::', 96],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
]) {
  blockedAddresses.addSubnet(prefix, bits, 'ipv6')
}

// dns.lookup wrapper that refuses private/reserved addresses. Checked at
// connect time, so a hostname can't pass validation and then re-resolve
// (DNS rebinding) to an internal address.
function publicOnlyLookup(hostname, options, callback) {
  dns.lookup(hostname, options, (err, address, family) => {
    if (err) return callback(err)
    const addresses = Array.isArray(address) ? address : [{ address, family }]
    const blocked = addresses.some((a) =>
      blockedAddresses.check(
        a.address,
        a.family === 6 || a.family === 'IPv6' ? 'ipv6' : 'ipv4'
      )
    )
    if (blocked) {
      return callback(
        new Error(`Refusing to connect to non-public address for ${hostname}`)
      )
    }
    callback(null, address, family)
  })
}

const publicOnlyAgent = new https.Agent({ lookup: publicOnlyLookup })

// A DNS hostname with a dot and an alphabetic TLD: rejects IP literals,
// ports, "localhost" and anything else that isn't a plain domain name.
const HOSTNAME_PATTERN =
  /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z](?:[a-z0-9-]{0,61}[a-z0-9])?$/i

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

const powMiddleware = createPowMiddleware({
  difficulty: POW_DIFFICULTY
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
// ---------- LNAddress for Podcastindex ----------
// ------------------------------------------------

app.get('/.well-known/keysend/podcastindex', (req, res) => {
  res.redirect('https://getalby.com/.well-known/keysend/podcastindex')
})

app.get('/.well-known/lnurlp/podcastindex', (req, res) => {
  res.redirect('https://getalby.com/.well-known/lnurlp/podcastindex')
})

// ------------------------------------------------
// ------ Web Bot Auth key directory (JWKS) -------
// ------------------------------------------------
//
// Publishes the PUBLIC Ed25519 key(s) the Aggrivator crawler uses to sign its
// requests, so Cloudflare and other verifiers can confirm a signed request
// really comes from us (Web Bot Auth / RFC 9421 HTTP Message Signatures).
//
// The body is served from server/data/http-message-signatures-directory.json so
// that adding/rotating a key is a content edit, not a code change. The exact
// media type below is mandatory — verifiers reject application/json.
//
// TODO(ops): replace the REPLACE_ME placeholder values in that JSON file with
// the real JWKS produced on the signing server. Never put private key material
// (a "d" member) in that file. The `kid` must match the crawler's advertised
// keyid.
//
// CDN/WAF: this endpoint must be reachable by automated clients with no bot
// challenge, redirect, or auth. The app applies no such gating to this path
// (the POW middleware only guards /api/*), but if Cloudflare (or any WAF) is in
// front of the site, ensure this exact path is allowed through unchallenged.
app.get('/.well-known/http-message-signatures-directory', (req, res) => {
  fs.readFile(
    './server/data/http-message-signatures-directory.json',
    'utf8',
    (err, data) => {
      if (err) {
        res.status(500).json({ error: 'key directory unavailable' })
        return
      }
      // Use setHeader (raw Node) rather than res.set/res.type so Express does
      // not append "; charset=utf-8" — verifiers expect this media type exactly.
      res.setHeader(
        'Content-Type',
        'application/http-message-signatures-directory+json'
      )
      res.setHeader('Cache-Control', 'public, max-age=3600')
      // Send a Buffer, not a string: res.send() force-appends "; charset=utf-8"
      // to the Content-Type for string bodies, which we must avoid here.
      res.send(Buffer.from(data))
    }
  )
})

// ------------------------------------------------
// ------------ Reverse proxy for API -------------
// ------------------------------------------------

app.get('/api/auth/config', (req, res) => {
  res.json({
    powDifficulty: POW_DIFFICULTY
  })
})

app.use('/api/search/byterm', powMiddleware, async (req, res) => {
  const response = await api.custom('search/byterm', req.query)
  res.send(response)
})

app.use('/api/search/bytitle', powMiddleware, async (req, res) => {
  let term = req.query.q
  const response = await api.custom('search/bytitle', { q: term })
  res.send(response)
})

app.use('/api/search/music/byterm', powMiddleware, async (req, res) => {
  let term = req.query.q
  const response = await api.custom('search/music/byterm', { q: term })
  res.send(response)
})

app.use('/api/search/byperson', powMiddleware, async (req, res) => {
  let person = req.query.q
  const response = await api.searchEpisodesByPerson(person)
  res.send(response)
})

app.use('/api/recent/episodes', powMiddleware, async (req, res) => {
  let max = req.query.max
  const response = await api.recentEpisodes(max)
  res.send(response)
})

app.use('/api/podcasts/bytag', powMiddleware, async (req, res) => {
  let max = req.query.max
  let start_at = req.query.start_at
  const response = await api.custom('podcasts/bytag', {
    'podcast-value': '',
    max: max,
    start_at: start_at,
  })
  res.send(response)
})

app.use('/api/podcasts/byfeedid', powMiddleware, async (req, res) => {
  let feedId = req.query.id
  const response = await api.podcastsByFeedId(feedId)
  res.send(response)
})

app.use('/api/podcasts/byguid', powMiddleware, async (req, res) => {
  let guid = req.query.guid
  const response = await api.custom('podcasts/byguid', { guid: guid })
  res.send(response)
})

app.use('/api/podcasts/byfeedurl', powMiddleware, async (req, res) => {
  let feedUrl = req.query.url
  const response = await api.podcastsByFeedUrl(feedUrl)
  res.send(response)
})

app.use('/api/episodes/byfeedid', powMiddleware, async (req, res) => {
  let feedId = req.query.id
  let max = req.query.max
  const response = await api.episodesByFeedId(feedId, null, max)
  res.send(response)
})

app.use('/api/add/byfeedurl', powMiddleware, async (req, res) => {
  let feedUrl = req.query.url
  const response = await apiAdd.addByFeedUrl(feedUrl)
  res.send(response)
})

// ------------------------------------------------
// ------------ API to get comments for episode ---
// ------------------------------------------------
app.use('/api/comments/byepisodeid', powMiddleware, async (req, res) => {
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
  const fetcher = makeRateLimitedFetcher(uncompressedFetch)

  // Disable buffering in the nginx server so that the delivery of
  // chunks are not delayed
  res.setHeader('X-Accel-Buffering', 'no')

  const sentCommenters = {}

  try {
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
  } catch (error) {
    console.error('Error fetching ActivityPub comments:', error)
    res.status(500).send('Error fetching ActivityPub comments')
  }

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
app.use('/api/comments/remoteInteractUrlPattern', powMiddleware, async (req, res) => {
  const interactorAccount = req.query.interactorAccount

  console.log('Debug interactorAccount', interactorAccount)

  if (typeof interactorAccount !== 'string') {
    res.status(400).send('Invalid interactorAccount')
    return
  }

  let splitIndex = 1
  if (interactorAccount.startsWith('@')) {
    splitIndex = 2
  }
  const interactorInstanceHost = interactorAccount.split('@')[splitIndex]
  if (!interactorInstanceHost || !HOSTNAME_PATTERN.test(interactorInstanceHost)) {
    res.status(400).send('Invalid interactorAccount')
    return
  }

  try {
    const response = await fetch(
      `https://${interactorInstanceHost}/.well-known/webfinger?` +
        new URLSearchParams({
          resource: `acct:${interactorAccount.substring(splitIndex - 1)}`,
        }),
      { agent: publicOnlyAgent, compress: false }
    )
    const parsedResponse = await response.json()

    const linkOStatusSubscribe = parsedResponse.links.find(
      (link) => link.rel === 'http://ostatus.org/schema/1.0/subscribe'
    )

    res.send({
      remoteInteractUrlPattern: linkOStatusSubscribe.template,
    })
  } catch (error) {
    console.error('Error fetching webfinger for interactor account:', error)
    res.status(502).send('Unable to look up interactor account')
  }
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

app.use('/api/datasets', async (req, res) => {
  fs.readFile('./server/data/public_datasets.json', 'utf8', (err, data) => {
    if (err) {
      res.status(500).send({})
      return
    }
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

app.use('/datasets', (req, res) => {
  res.render('index', {
    title: 'Datasets',
    description:
      'Open datasets generated and published by the Podcast Index project.',
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
// Only listen when run directly, so the app can be imported by tests.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`)
  })
}

module.exports = app
