// https://api.podcastindex.org/api/1.0/recent/episodes?max=7
import crypto from 'crypto'

// export const api = require('podcast-index-api')(
//     process.env.API_KEY,
//     process.env.API_SECRET
// )

let baseUrl = `https://api.podcastindex.org/api/1.0`
let key = process.env.API_KEY
let secret = process.env.API_SECRET

const generate_auth = () => {
    let dt = Math.floor(Date.now() / 1000)
    return {
        'X-Auth-Date': dt,
        'X-Auth-Key': key,
        Authorization: crypto
            .createHash('sha1')
            .update(key + secret + dt)
            .digest('hex'),
        'User-Agent': 'PodcastIndexBot/@podcast@noagendasocial.com',
    }
}

const recent_episodes = async (max: number) => {
    let response = await fetch(`${baseUrl}/recent/episodes?max=${max || 7}`, {
        credentials: 'same-origin',
        // mode: 'cors',
        method: 'GET',
        // @ts-ignore
        headers: {
            ...generate_auth(),
        },
    })
    // return recentList.items
    return await response.json()
}

const search_feeds = async (term: string) => {
    let response = await fetch(`${baseUrl}/search/byterm?q=${term}`, {
        credentials: 'same-origin',
        // mode: 'cors',
        method: 'GET',
        // @ts-ignore
        headers: {
            ...generate_auth(),
        },
    })
    // return recentList.items
    return await response.json()
}

export default {
    recent_episodes,
    search_feeds,
}
