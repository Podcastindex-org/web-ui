import * as React from 'react'
import ReactList from 'react-list'
import ReactLoading from 'react-loading'
import PodcastHeader from '../../../components/PodcastHeader'
import Player from '../../../components/Player'
import EpisodeItem from '../../../components/EpisodeItem'
import {fixURL, updateTitle} from '../../../utils'
const he = require('he')

import './styles.scss'

interface IProps {
    match: any
    result?: Object
}

export default class PodcastInfo extends React.PureComponent<IProps> {
    state = {
        result: Object(),
        episodes: [],
        loading: true,
        selectedEpisode: undefined,
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
            const result = (await this.getPodcastInfo(id)).feed
            const episodes = (await this.getEpisodes(id)).items
            if (this._isMounted) {
                this.setState({
                    loading: false,
                    result,
                    episodes,
                    selectedEpisode: episodes[0],
                })
            }
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
            const result = (await this.getPodcastInfo(id)).feed
            const episodes = (await this.getEpisodes(id)).items
            this.setState({
                loading: false,
                result,
                episodes,
                selectedEpisode: episodes[0],
            })
        }
    }

    async getPodcastInfo(id: string) {
        let response = await fetch(`/api/podcasts/byfeedid?id=${id}`, {
            // credentials: 'same-origin',
            method: 'GET',
        })
        return await response.json()
    }

    async getEpisodes(id: string) {
        let response = await fetch(`/api/episodes/byfeedid?id=${id}`, {
            // credentials: 'same-origin',
            method: 'GET',
        })
        return await response.json()
    }

    onEpisodePlay(index: number) {
        this.setState({
            playing: true,
        })

        if (index === undefined) {
            index = this.state.episodes.findIndex(
                (x) => x === this.state.selectedEpisode
            )
        }
        const episode = this.state.episodes[index]

        if (this.state.selectedEpisode !== episode) {
            this.setState({
                selectedEpisode: episode,
            })
        }

        // FIXME: this doesn't trigger if episode was changed. Workaround, for now, is to set the playing state here
        // and then check it when onCanPlay is triggered (handled by onEpisodeCanPlay) where the play call can be
        // made again.
        this.player.current.play()

        // set all but current episode button to play; current to pause
        this.episodeItems.forEach((episodeItem) => {
            episodeItem.current.setPlaying(
                index === episodeItem.current.props.index
            )
        })
    }

    onEpisodePause() {
        this.setState({
            playing: false,
        })

        this.player.current.pause()

        // set episode buttons to play
        this.episodeItems.forEach((episodeItem) => {
            episodeItem.current.setPlaying(false)
        })
    }

    onEpisodeCanPlay() {
        if (this.state.playing) {
            this.player.current.play()
        }
    }

    renderHeader() {
        let title = this.state.result.title
        let image = this.state.result.image || this.state.result.artwork
        let author = this.state.result.author
        let description = this.state.result.description
        let categories = this.state.result.categories
        let value = this.state.result.value
        let id = this.state.result.id
        let podcastURL = fixURL(this.state.result.link)
        let feedURL = fixURL(this.state.result.url)
        let donationPageURL = null
        if (this.state.result.funding) // not null, exists
        {
            donationPageURL = this.state.result.funding?.url
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
        return (
            <div className="podcast-header-player">
                {
                    this.state.episodes.length > 0
                        ?
                        <Player
                            ref={this.player}
                            episode={this.state.selectedEpisode}
                            onPlay={this.onEpisodePlay}
                            onPause={this.onEpisodePause}
                            onCanPlay={this.onEpisodeCanPlay}
                        />
                        :
                        <div></div>
                }
            </div>
        )
    }

    renderEpisodes() {
        return (
            <div className="episodes-list">
                <h2 className="episode-header">Episodes</h2>
                {
                    this.state.episodes.length > 0
                        ?
                        <ReactList
                            minSize={10}
                            pageSize={10}
                            itemRenderer={this.renderEpisode.bind(this)}
                            length={this.state.episodes.length}
                            type="simple"
                        />
                        :
                        <div>
                            No episodes found
                        </div>
                }
            </div>
        )
    }

    renderEpisode(index: number, key: number) {
        let title = this.state.episodes[index].title
        // try to use episode image, fall back to feed images
        let image =
            this.state.episodes[index].image ||
            this.state.episodes[index].feedImage ||
            this.state.result.image ||
            this.state.result.artwork
        let link = this.state.episodes[index].link
        let enclosureUrl = fixURL(this.state.episodes[index].enclosureUrl)
        let description = he.decode(this.state.episodes[index].description)
        let datePublished = this.state.episodes[index].datePublished
        let value = this.state.episodes[index].value

        // create a reference to the generated EpisodeItem if one doesn't already exist
        if (index >= this.episodeItems.length) {
            this.episodeItems.push(React.createRef<EpisodeItem>())
        }

        return (
            <div key={key}>
                <EpisodeItem
                    ref={this.episodeItems[index]}
                    index={index}
                    title={title}
                    image={image}
                    link={link}
                    value={value}
                    enclosureUrl={enclosureUrl}
                    description={description}
                    datePublished={datePublished}
                    onPlay={this.onEpisodePlay}
                    onPause={this.onEpisodePause}
                />
            </div>
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
