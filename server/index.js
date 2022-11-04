const path = require('path')
const fs = require('fs');
const express = require('express')
const app = express() // create express app
const { makeThreadcap, InMemoryCache, updateThreadcap, makeRateLimitedFetcher } = require('threadcap');
const fetch = require('node-fetch');
const packageJson = require('../package.json');

// Gets the .env variables
require('dotenv').config()

const USER_AGENT = `Podcastindex.org-web/${packageJson.version}`;

// Utilizing the node repo from comster/podcast-index-api :)
// NOTE: This server will work as a reverse proxy.
const api = require('podcast-index-api')(
    process.env.API_KEY,
    process.env.API_SECRET
)

const apiAdd = require('podcast-index-api')(
    process.env.API_ADD_KEY,
    process.env.API_ADD_SECRET
)

app.use((req, res, next) => {

    const { rawHeaders, httpVersion, method, socket, url } = req;
    const { remoteAddress, remoteFamily } = socket;

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

    var logString = "["+Date.now()+"] " + "["+remoteAddress+"] " + method +" ("+url+") - UA: ["+userAgent+"] - LOC: ["+cfLocation+"|"+cfSourceIP+"] - BOT: ["+cfBotScore+"]"

    console.log(logString)

    next();
});

// ------------------------------------------------
// ---------- Static files for namespace ----------
// ------------------------------------------------

app.use('/namespace/1.0', async (req, res) => {
    fs.readFile('./server/data/namespace1.0.html', 'utf8', (err, data) => {
        // You should always specify the content type header,
        // when you don't use 'res.json' for sending JSON.
        res.set('Content-Type', 'text/html');
        res.send(data)
    })
})

// ------------------------------------------------
// ------------ Reverse proxy for API -------------
// ------------------------------------------------

app.use('/api/search/byterm', async (req, res) => {
    let term = req.query.q
    const response = await api.searchByTerm(term)
    res.send(response)
})

app.use('/api/search/bytitle', async (req, res) => {
    let term = req.query.q
    const response = await api.custom('search/bytitle', {q: term})
    res.send(response)
})

app.use('/api/recent/episodes', async (req, res) => {
    let max = req.query.max
    const response = await api.recentEpisodes(max)
    res.send(response)
})

app.use('/api/podcasts/bytag', async (req, res) => {
    const response = await api.podcastsByTag()
    res.send(response)
})

app.use('/api/podcasts/byfeedid', async (req, res) => {
    let feedId = req.query.id
    const response = await api.podcastsByFeedId(feedId)
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

app.use('/api/episodes/live', async (req, res) => {
    let max = req.query.max
    const response = await api.custom('episodes/live', {pretty: true, max: max})
    const minPublished = Math.floor(new Date().getTime() / 1000) - 3600

    // assume live episodes posted within the past hour are live
    // since the api doesn't provide start and end times

    response.items = response.items.filter(item => {
        return item.datePublished >= minPublished
    })

    response.count = response.items.length;

    if (response.count === 0) {
        response.description = 'No matching items'
    }

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
    let episodeId = req.query.id;
    const response = await api.episodesById(episodeId, false);

    const socialInteract = response.episode.socialInteract && response.episode.socialInteract.filter((si) => si.protocol === 'activitypub');

    if(!socialInteract && socialInteract.lenght >= 0) {
        // Bad requests sounds appropriate, as the client is only expected to call this API
        // when it validated upfront that the episode has a property socialInteract with activitypub protocol
        res.status(400).send('The episode does not contain a socialInteract property')
    }

    const userAgent = USER_AGENT;
    const cache = new InMemoryCache();
    const fetcher = makeRateLimitedFetcher(fetch);

    const sentCommenters = {};

    const threadcap = await makeThreadcap(socialInteract[0].uri, { userAgent, cache, fetcher });

    const callbacks = {
        onEvent: e => {
            if (e.kind === 'node-processed' && e.part === 'replies') {
                writeThreadcapChunk(e.nodeId, threadcap, sentCommenters, res);
            }
        }
    }

    await updateThreadcap(threadcap, { updateTime: new Date().toISOString(), userAgent, cache, fetcher, callbacks });

    res.end()
})

function writeThreadcapChunk(processedNodeId, threadcap, sentCommenters, res) {
    const threadcapChunk = {};

    threadcapChunk.roots = threadcap.roots.filter((root) => root === processedNodeId);
    threadcapChunk.nodes = {};
    threadcapChunk.nodes[processedNodeId] = threadcap.nodes[processedNodeId];

    const comment = threadcapChunk.nodes[processedNodeId].comment;

    // nodes are always new, but commenters can be repeated, we only include
    // them in th chunk if they have not been sent before, as there is no purpose
    // on sending them again.
    // this could be determines by inspecting previous nodes, but this way
    // is easier.
    if(comment && !sentCommenters[comment.attributedTo]) {
        sentCommenters[comment.attributedTo] = true;
        threadcapChunk.commenters = {};
        threadcapChunk.commenters[comment.attributedTo] = threadcap.commenters[comment.attributedTo];
    }

    res.write(JSON.stringify(threadcapChunk))
}

// ------------------------------------------------
// ---------- Static files for API data -----------
// ------------------------------------------------

app.use('/api/stats', async (req, res) => {
    fs.readFile('./server/data/stats.json', 'utf8', (err, data) => {
        // You should always specify the content type header,
        // when you don't use 'res.json' for sending JSON.  
        res.set('Content-Type', 'application/json');
        res.send(data)
      })
})

app.use('/api/newfeedstats', async (req, res) => {
    fs.readFile('./server/data/newfeedstats.json', 'utf8', (err, data) => {
        // You should always specify the content type header,
        // when you don't use 'res.json' for sending JSON.
        res.set('Content-Type', 'application/json');
        res.send(data)
    })
})

app.use('/api/apps', async (req, res) => {
    fs.readFile('./server/data/apps.json', 'utf8', (err, data) => {
        // You should always specify the content type header,
        // when you don't use 'res.json' for sending JSON.  
        res.set('Content-Type', 'application/json');
        res.send(data)
      })
})

app.use('/api/images', express.static('./server/assets'))

// ------------------------------------------------
// ---------- Static content for client -----------
// ------------------------------------------------

app.use(express.static('./server/www'))
app.get('*', (req, res) => res.sendFile(path.resolve('server', 'www', 'index.html')))

// ------------------------------------------------


const PORT = process.env.PORT || 333;

// start express server on port 5001 (default)
app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`)
})
