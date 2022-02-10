import * as React from 'react'
import ReactLoading from 'react-loading'
import EpisodeItem from '../../../components/EpisodeItem'
import InfiniteList from "../../../components/InfiniteList";
import Player from '../../../components/Player'
import PodcastHeader from '../../../components/PodcastHeader'
import { fixURL, updateTitle } from '../../../utils'
import './styles.scss'

const he = require('he')

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
        this.renderEpisode = this.renderEpisode.bind(this)
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
        const episodes: Array<any> = (await this.getEpisodes(id)).items
        if (this._isMounted) {
            this.setState({
                loading: false,
                result,
                episodes,
                selectedEpisode: episodes[0],
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
        return await response.json()
    }

    onEpisodePlay(index: number) {
        const {episodes, selectedEpisode} = this.state
        this.setState({
            playing: true,
        })

        if (index === undefined) {
            index = episodes.findIndex(
                (x) => x === selectedEpisode
            )
        }
        const episode = episodes[index]

        if (selectedEpisode !== episode) {
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
        const {playing} = this.state
        if (playing) {
            this.player.current.play()
        }
    }

    renderHeader() {
        let {result} = this.state
        let {title, image, artwork, author, description, categories, value, id, link, url, funding} = result
        image = image || artwork
        let podcastURL = fixURL(link)
        let feedURL = fixURL(url)
        let donationPageURL = null
        if (result.funding) // not null, exists
        {
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
        const {episodes, selectedEpisode} = this.state
        return (
            <div className="podcast-header-player">
                {
                    episodes.length > 0
                        ?
                        <Player
                            ref={this.player}
                            episode={selectedEpisode}
                            onPlay={this.onEpisodePlay}
                            onPause={this.onEpisodePause}
                            onCanPlay={this.onEpisodeCanPlay}
                        />
                        :
                        <div/>
                }
            </div>
        )
    }

    renderEpisodes() {
        const {episodes} = this.state
        return (
            <div className="episodes-list">
                <h2 className="episode-header">Episodes</h2>
                {
                    episodes.length > 0
                        ?
                        <InfiniteList
                            data={episodes}
                            itemRenderer={this.renderEpisode}
                        />
                        :
                        <div>
                            No episodes found
                        </div>
                }
            </div>
        )
    }


    renderEpisode(item, index: number) {
        let {title, image, feedImage, link, enclosureUrl, description, datePublished, value} = item
        let {result} = this.state
        // try to use episode image, fall back to feed images
        image =
            image ||
            feedImage ||
            result.image ||
            result.artwork
        enclosureUrl = fixURL(enclosureUrl)
        description = he.decode(description)

        // create a reference to the generated EpisodeItem if one doesn't already exist
        if (index >= this.episodeItems.length) {
            this.episodeItems.push(React.createRef<EpisodeItem>())
        }

        return (
            <div key={index}>
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
        const {loading, result} = this.state
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
                {this.renderPlayer()}
                {this.renderEpisodes()}
            </div>
        )
    }
}
