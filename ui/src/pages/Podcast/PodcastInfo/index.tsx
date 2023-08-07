import { History } from "history";
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
    history?: History
}

export default class PodcastInfo extends React.PureComponent<IProps> {
    state = {
        result: Object(),
        episodes: {
            items: [],
            live: [],
        },
        loadingFeed: true,
        loadingEpisodes: true,
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
                loadingFeed: true,
                loadingEpisodes: true,
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
        let feedId = id
        let result = (await this.getPodcastInfo(id)).feed
        // when no items, returns array instead of object so check for that
        if (result && result?.length === 0) {
            const resultFeedGuid = (await this.getPodcastInfoGuid(id)).feed
            if (resultFeedGuid && resultFeedGuid?.length === 0) {
                // when no items, returns array instead of object so check for that
            } else if (resultFeedGuid) {
                result = resultFeedGuid
                feedId = result.id
                this.props.history.replace(`/podcast/${feedId}${this.props.location.search}`)
            }
        }

        if (this._isMounted) {
            this.setState({
                loadingFeed: false,
                result,
            })
        }

        const max = result.episodeCount || 1000
        const episodes = (await this.getEpisodes(feedId, max))
        const episodeId = cleanSearchQuery(this.props.location.search, "episode")

        if (this._isMounted) {
            this.setState({
                episodes,
                episodeId: Number(episodeId),
                loadingEpisodes: false,
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

    async getPodcastInfoGuid(guid: string) {
        // noinspection SpellCheckingInspection
        let response = await fetch(`/api/podcasts/byguid?guid=${guid}`, {
            // credentials: 'same-origin',
            method: 'GET',
        })
        return await response.json()
    }

    async getEpisodes(id: string, max: number = 1000) {
        // noinspection SpellCheckingInspection
        let response = await fetch(`/api/episodes/byfeedid?id=${id}&max=${max}`, {
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
        const {loadingFeed, loadingEpisodes, result, episodeId, episodes} = this.state
        if ((result === undefined || result.length === 0) && !loadingFeed) {
            const errorMessage = `Unknown podcast ID: ${this.props.match.params.podcastId}`
            updateTitle(errorMessage)
            return <div className="page-content">{errorMessage}</div>
        }
        if (loadingFeed) {
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
                {
                    loadingEpisodes ?
                        <div className="loader-wrapper" style={{height: 300}}>
                            <ReactLoading type="cylon" color="#e90000"/>
                        </div>
                        :
                        <EpisodesPlayer
                            podcast={result}
                            episodes={episodes}
                            selectedId={episodeId}
                            onSelectedEpisodeChange={this.onSelectedEpisodeChange}
                        />
                }
            </div>
        )
    }
}
