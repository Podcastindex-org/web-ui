import * as React from 'react'
import ReactLoading from 'react-loading'
import EpisodesPlayer from "../../../components/EpisodesPlayer";
import PodcastHeader from '../../../components/PodcastHeader'
import { cleanSearchQuery, fixURL, getImage, updateTitle } from '../../../utils'
import './styles.scss'

interface IProps {
    match: any
    result?: Object
    location: any
    history?: any
}

export default class PodcastInfo extends React.PureComponent<IProps> {
    state = {
        result: Object(),
        episodes: {
            items: [],
            live: [],
        },
        loading: true,
        episodeId: -1,
    }
    _isMounted = false
    unlisten = undefined

    constructor(props) {
        super(props)

        this.onSelectedEpisodeChange = this.onSelectedEpisodeChange.bind(this)
    }

    async componentDidMount(): Promise<void> {
        this._isMounted = true

        let id = this.props.match.params.podcastId
        if (id) {
            await this.fetchData(id)
        }
        // handle link to same page clicked by temporarily removing and resetting episodeId
        this.unlisten = this.props.history.listen(() => {
            this.setState(
                {
                    episodeId: -1
                },
                () => {
                    this.setState({
                        episodeId: Number(cleanSearchQuery(this.props.location.search, "episode"))
                    })
                }
            )
        })
    }

    componentWillUnmount() {
        this._isMounted = false
        this.unlisten()
    }

    async componentDidUpdate(prevProps) {
        let id = this.props.match.params.podcastId

        let episodeId = cleanSearchQuery(this.props.location.search, "episode")
        let prevEpisodeId = cleanSearchQuery(prevProps.location.search, "episode")

        if (id !== prevProps.match.params.podcastId) {
            this.setState({
                loading: true,
            })
            await this.fetchData(id)
        } else if (episodeId !== prevEpisodeId) {
            this.setState({
                episodeId: Number(episodeId)
            })
        }
    }

    onSelectedEpisodeChange(episodeId: number): void {
        let {result, episodes} = this.state
        let {title} = result

        const episode = episodes.items.find((ep) => ep.id === episodeId)
        const liveEpisode = episodes.live.find((ep) => ep.id === episodeId)
        if (episode) {
            updateTitle(`${title} | ${episode.title}`)
        } else if (liveEpisode) {
            updateTitle(`${title} | ${liveEpisode.title}`)
        } else {
            updateTitle(title)
        }
    }

    async fetchData(id) {
        const result = (await this.getPodcastInfo(id)).feed
        const episodes = (await this.getEpisodes(id))
        const episodeId = cleanSearchQuery(this.props.location.search, "episode")

        if (this._isMounted) {
            this.setState({
                episodes,
                episodeId: Number(episodeId),
                loading: false,
                result,
            })
        }
    }

    async getPodcastInfo(id: string) {
        // noinspection SpellCheckingInspection
        let response = await fetch(`/api/podcasts/byfeedid?id=${id}`, {
            // credentials: 'same-origin',
            method: 'GET',
        })
        return await response.json()
    }

    async getEpisodes(id: string) {
        // noinspection SpellCheckingInspection
        let response = await fetch(`/api/episodes/byfeedid?id=${id}&max=100`, {
            // credentials: 'same-origin',
            method: 'GET',
        })

        const episodes = await response.json()

        return {
            items: episodes.items,
            live: episodes.liveItems.filter(
                item => item.status === 'live'
            ),
        }
    }

    renderHeader() {
        let {result} = this.state
        let {
            title,
            author,
            description,
            categories,
            value,
            id,
            link,
            url,
            funding,
        } = result
        const image = getImage(result)
        let podcastURL = fixURL(link)
        let feedURL = fixURL(url)
        let donationPageURL = null
        if (result.funding) {
            // not null, exists
            donationPageURL = funding?.url
        }

        updateTitle(title)
        return (
            <PodcastHeader
                title={title}
                author={author}
                image={image}
                description={description}
                categories={categories}
                value={value}
                id={id}
                podcastURL={podcastURL}
                donationPageURL={donationPageURL}
                feedURL={feedURL}
            />
        )
    }

    render() {
        const {loading, result, episodeId, episodes} = this.state
        if ((result === undefined || result.length === 0) && !loading) {
            const errorMessage = `Unknown podcast ID: ${this.props.match.params.podcastId}`
            updateTitle(errorMessage)
            return <div className="page-content">{errorMessage}</div>
        }
        if (loading) {
            updateTitle('Loading podcast ...')
            return (
                <div className="loader-wrapper" style={{height: 300}}>
                    <ReactLoading type="cylon" color="#e90000"/>
                </div>
            )
        }

        return (
            <div className="page-content">
                {this.renderHeader()}
                <EpisodesPlayer
                    podcast={result}
                    episodes={episodes}
                    selectedId={episodeId}
                    onSelectedEpisodeChange={this.onSelectedEpisodeChange}
                />
            </div>
        )
    }
}
