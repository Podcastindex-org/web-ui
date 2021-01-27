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

app.use('/namespace/1.0', async (req, res) => {
    res.redirect(301, 'https://github.com/Podcastindex-org/podcast-namespace/blob/main/docs/1.0.md')
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
