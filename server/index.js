const path = require('path')
const fs = require('fs');
const express = require('express')
const app = express() // create express app
// Gets the .env variables
require('dotenv').config()

// Utilizing the node repo from comster/podcast-index-api :)
// NOTE: This server will work as a reverse proxy.
const api = require('podcast-index-api')(
    process.env.API_KEY,
    process.env.API_SECRET
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

app.use('/api/recent/episodes', async (req, res) => {
    let max = req.query.max
    const response = await api.recentEpisodes(max)
    res.send(response)
})

// TODO borrowing from podcast-index-api package until generic API support added
const withResponse = (response) => {
    // Check for success or failure and create a predictable error response
    let body = response.body
    // if response.statusCode == 200?
    if (
        response.statusCode == 500 ||
        (body.hasOwnProperty('status') && body.status === 'false')
    ) {
        // Failed
        if (body.hasOwnProperty('description')) {
            // Error message from server API
            throw { message: body.description, code: response.statusCode }
        } else {
            throw { message: 'Request failed.', code: response.statusCode }
        }
    } else {
        // Success // 200
        return body
    }
}

app.use('/api/podcasts/bytag', async (req, res) => {
    // TODO not currently supported by podcast-index-api package so call directly
    const response = await api.api('podcasts/bytag?podcast-value')
    res.send(withResponse(response))
})

app.use('/api/podcasts/byfeedid', async (req, res) => {
    let feedId = req.query.id
    const response = await api.podcastsByFeedId(feedId)
    res.send(response)
})

app.use('/api/episodes/byfeedid', async (req, res) => {
    let feedId = req.query.id
    const response = await api.episodesByFeedId(feedId)
    res.send(response)
})

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
