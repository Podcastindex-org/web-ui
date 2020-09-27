const path = require('path')
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

app.use(express.static('www'))

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

app.get('*', (req, res) => res.sendFile(path.resolve('www', 'index.html')))

// start express server on port 5001 (default)
app.listen(process.env.SERVER_PORT, () => {
    console.log(`server started on port ${process.env.SERVER_PORT}`)
})
