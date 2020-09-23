// R8NRARDAMXGTCZRAJUUD

// https://api.podcastindex.org/api/1.0/recent/episodes?max=7
import crypto from 'crypto'

class Api {
    private baseUrl: string
    private apiKey = process.env.API_KEY
    private apiSecret = process.env.API_SECRET

    constructor(route_name: string) {
        this.baseUrl = `https://api.podcastindex.org/api/1.0/${route_name}`
    }

    private generate_auth() {
        let apiHeaderTime = Math.floor(Date.now() / 1000)
        let sha1Algorithm = 'sha1'
        let sha1Hash = crypto.createHash(sha1Algorithm)
        let data4Hash = this.apiKey + this.apiSecret + apiHeaderTime
        sha1Hash.update(data4Hash)
        let hash4Header = sha1Hash.digest('hex')
        return {
            'X-Auth-Date': '' + apiHeaderTime,
            'X-Auth-Key': this.apiKey,
            Authorization: hash4Header,
            'User-Agent': 'SuperPodcastPlayer/1.8',
        }
    }

    async recent_episodes(max: number) {
        let response = await fetch(`${this.baseUrl}/episodes?max=${max || 7}`, {
            mode: 'cors',
            method: 'GET',
            headers: {
                'Access-Control-Allow-Origin': '*',
                ...this.generate_auth(),
            },
        })
        return await response.json()
    }
}

export default new Api('recent')
