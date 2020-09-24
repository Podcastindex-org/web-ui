// R8NRARDAMXGTCZRAJUUD

// https://api.podcastindex.org/api/1.0/recent/episodes?max=7
import crypto from 'crypto'
import { recentList } from '../data'

// export const api = require('podcast-index-api')(
//     process.env.API_KEY,
//     process.env.API_SECRET
// )

class Api {
    private baseUrl: string
    private key = process.env.API_KEY
    private secret = process.env.API_SECRET

    constructor(route_name: string) {
        this.baseUrl = `https://api.podcastindex.org/api/1.0/${route_name}`
    }

    private generate_auth() {
        let dt = Math.floor(Date.now() / 1000)
        return {
            'X-Auth-Date': dt,
            'X-Auth-Key': this.key,
            Authorization: crypto
                .createHash('sha1')
                .update(this.key + this.secret + dt)
                .digest('hex'),
            'User-Agent': 'PodcastIndexBot/@podcast@noagendasocial.com',
        }
    }

    async recent_episodes(max: number) {
        // let response = await fetch(`${this.baseUrl}/episodes?max=${max || 7}`, {
        //     mode: 'cors',
        //     method: 'GET',
        //     headers: {
        //         // 'Access-Control-Allow-Origin': '*',
        //         ...this.generate_auth(),
        //     },
        // })
        return recentList.items
        // return await response.json()
    }
}

export default new Api('recent')
