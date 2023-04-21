import * as React from 'react'
import ReactLoading from 'react-loading'
import EpisodeList from '../../../components/EpisodeList'
import Player from '../../../components/Player'
import PodcastHeader from '../../../components/PodcastHeader'
import { fixURL, getImage, updateTitle } from '../../../utils'
import './styles.scss'

interface IProps {
    match: any
    result?: Object
}

export default class PodcastInfo extends React.PureComponent<IProps> {
    state = {
        result: Object(),
        episodes: Object(),
        loading: true,
        selectedEpisode: undefined,
        playingEpisode: undefined,
        playing: false,
    }
    _isMounted = false
    player = React.createRef<Player>()
    episodeItems: any[] = []

    constructor(props) {
        super(props)
        // fix this in handlers
        this.onEpisodePlay = this.onEpisodePlay.bind(this)
        this.onEpisodePause = this.onEpisodePause.bind(this)
        this.onEpisodeCanPlay = this.onEpisodeCanPlay.bind(this)
    }

    async componentDidMount(): Promise<void> {
        this._isMounted = true

        let id = this.props.match.params.podcastId
        if (id) {
            await this.fetchData(id)
        }
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    async componentDidUpdate(prevProps) {
        let id = this.props.match.params.podcastId
        if (id !== prevProps.match.params.podcastId) {
            this.setState({
                loading: true,
            })
            await this.fetchData(id)
        }
    }

    async fetchData(id) {
        const result = (await this.getPodcastInfo(id)).feed
        const episodes = (await this.getEpisodes(id))

        if (this._isMounted) {
            let selectedEpisode = episodes.items[0]

            if (episodes.live.length > 0) {
                selectedEpisode = episodes.live[0]
            }

            this.setState({
                loading: false,
                result,
                episodes,
                selectedEpisode,
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

    onEpisodePlay(episode: object) {
        const { selectedEpisode } = this.state

        if (!episode) {
            episode = selectedEpisode
        }

        this.setState({
            playing: true,
            playingEpisode: episode,
        })

        if (selectedEpisode !== episode) {
            this.setState({
                selectedEpisode: episode,
            })
        }

        // FIXME: this doesn't trigger if episode was changed. Workaround, for now, is to set the playing state here
        // and then check it when onCanPlay is triggered (handled by onEpisodeCanPlay) where the play call can be
        // made again.
        this.player.current.play()
    }

    onEpisodePause() {
        this.setState({
            playing: false,
            playingEpisode: null,
        })

        this.player.current.pause()
    }

    onEpisodeCanPlay() {
        const { playing } = this.state
        if (playing) {
            this.player.current.play()
        }
    }

    renderHeader() {
        let { result } = this.state
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

    renderPlayer() {
        const { selectedEpisode, playing, result } = this.state
        const preload = playing ? 'auto' : 'none'
        return (
            <div className="podcast-header-player">
                {selectedEpisode ? (
                    <Player
                        ref={this.player}
                        episode={selectedEpisode}
                        podcast={result}
                        onPlay={this.onEpisodePlay}
                        onPause={this.onEpisodePause}
                        onCanPlay={this.onEpisodeCanPlay}
                        preload={preload}
                    />
                ) : (
                    <div />
                )}
            </div>
        )
    }

    renderEpisodes() {
        const { result, episodes, playingEpisode } = this.state

        return (
            <>
                {episodes.live.length > 0 ? (
                    <EpisodeList
                        title="Live Now!"
                        podcast={result}
                        episodes={episodes.live}
                        playingEpisode={playingEpisode}
                        onEpisodePlay={this.onEpisodePlay}
                        onEpisodePause={this.onEpisodePause}
                    />
                ) : ''}
                <EpisodeList
                    title="Episodes"
                    podcast={result}
                    episodes={episodes.items}
                    playingEpisode={playingEpisode}
                    onEpisodePlay={this.onEpisodePlay}
                    onEpisodePause={this.onEpisodePause}
                />
            </>
        )
    }

    render() {
        const { loading, result } = this.state
        if ((result === undefined || result.length === 0) && !loading) {
            const errorMessage = `Unknown podcast ID: ${this.props.match.params.podcastId}`
            updateTitle(errorMessage)
            return <div className="page-content">{errorMessage}</div>
        }
        if (loading) {
            updateTitle('Loading podcast ...')
            return (
                <div className="loader-wrapper" style={{ height: 300 }}>
                    <ReactLoading type="cylon" color="#e90000" />
                </div>
            )
        }
        return (
            <div className="page-content">
                {this.renderHeader()}
                {this.renderPlayer()}
                {this.renderEpisodes()}
            </div>
        )
    }
}
