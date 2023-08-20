import * as React from 'react'
import Player from '../../components/Player'
import EpisodeList from "../EpisodeList";
import './styles.scss'

interface IProps {
    episodes?: {
        items: Array<any>,
        live?: Array<any>,
    }
    selectedId?: number
    podcast?: {
        id: number
        url: string
        author: string
        title: string
        language: string
        medium: string
    }
    initialDisplay?: number
    onSelectedEpisodeChange?: (episodeId: number) => void
    liveTitle?: string
    episodesTitle?: string
}

export default class EpisodesPlayer extends React.PureComponent<IProps> {
    static defaultProps = {
        liveTitle: "Live Now!",
        episodesTitle: "Episodes",
    }
    state = {
        selectedEpisode: undefined,
        selectedEpisodeIsLive: false,
        playingEpisode: undefined,
        playing: false,
    }
    _isMounted = false
    player = React.createRef<Player>()

    constructor(props) {
        super(props)
        // fix this in handlers
        this.onEpisodePlay = this.onEpisodePlay.bind(this)
        this.onEpisodePause = this.onEpisodePause.bind(this)
        this.onEpisodeCanPlay = this.onEpisodeCanPlay.bind(this)
    }

    async componentDidMount(): Promise<void> {
        const {selectedId} = this.props
        this.updateSelectedEpisode(selectedId)
        this._isMounted = true
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    async componentDidUpdate(prevProps) {
        const {selectedId} = this.props
        const prevSelectedId = prevProps.selectedId

        if (selectedId !== prevSelectedId) {
            this.updateSelectedEpisode(selectedId)
        }
    }

    updateSelectedEpisode(episodeId: number) {
        const {episodes, onSelectedEpisodeChange} = this.props
        const {playing, selectedEpisode} = this.state

        let episodeIndex = -1
        let episodeIndexLive = -1
        if (episodeId) {
            episodeIndex = episodes.items.findIndex((ep) => ep.id === episodeId)
            episodeIndexLive = episodes.live.findIndex((ep) => ep.id === episodeId)
        }

        let newSelectedEpisode
        let liveEpisode = false
        if (episodeIndexLive >= 0 && episodes.live?.length > 0) {
            newSelectedEpisode = episodes.live[episodeIndexLive]
            liveEpisode = true
        } else {
            if (episodeIndex < 0) {
                episodeIndex = 0
            }
            newSelectedEpisode = episodes.items[episodeIndex]
        }

        if (playing && selectedEpisode !== newSelectedEpisode) {
            this.onEpisodePause()
        }

        this.setState(
            {
                selectedEpisode: newSelectedEpisode,
                selectedEpisodeIsLive: liveEpisode
            },
            () => {
                if (onSelectedEpisodeChange && newSelectedEpisode !== undefined) {
                    onSelectedEpisodeChange(newSelectedEpisode.id)
                }
            })
    }

    onEpisodePlay(episode: object) {
        const {selectedEpisode} = this.state

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
        const {playing} = this.state
        if (playing) {
            this.player.current.play()
        }
    }

    renderPlayer() {
        const {podcast} = this.props
        const {selectedEpisode, playing} = this.state
        const preload = playing ? 'auto' : 'none'
        return (
            <div className="podcast-header-player">
                {selectedEpisode ? (
                    <Player
                        ref={this.player}
                        episode={selectedEpisode}
                        podcast={podcast}
                        onPlay={this.onEpisodePlay}
                        onPause={this.onEpisodePause}
                        onCanPlay={this.onEpisodeCanPlay}
                        preload={preload}
                    />
                ) : (
                    <div/>
                )}
            </div>
        )
    }

    renderEpisodes() {
        const {
            podcast,
            episodes,
            selectedId,
            initialDisplay,
            episodesTitle,
            liveTitle
        } = this.props
        const {playingEpisode, selectedEpisodeIsLive} = this.state
        const {medium} = podcast

        let makeVisible = null
        if (selectedId) {
            makeVisible = {field: "id", value: selectedId}
        }

        let sortedEpisodes = episodes.items
        if (medium.toLowerCase() === "music") {
            sortedEpisodes.sort((a, b) => {
                if (a.season === b.season) {
                    return a.episode < b.episode ? -1 : 1
                } else {
                    return a.season < b.season ? -1 : 1
                }
            })
        }

        let sortedLiveEpisodes = episodes.live
        // short live episodes with newest first
        sortedLiveEpisodes?.sort((a, b) => {
            return a.startTime < b.startTime ? 1 : -1
        })

        return (
            <>
                {episodes.live?.length > 0 ? (
                    <EpisodeList
                        title={liveTitle}
                        podcast={podcast}
                        episodes={sortedLiveEpisodes}
                        playingEpisode={playingEpisode}
                        makeVisible={selectedEpisodeIsLive ? makeVisible : null}
                        initialDisplay={initialDisplay}
                        onEpisodePlay={this.onEpisodePlay}
                        onEpisodePause={this.onEpisodePause}
                    />
                ) : ''}
                <EpisodeList
                    title={episodesTitle}
                    podcast={podcast}
                    episodes={sortedEpisodes}
                    playingEpisode={playingEpisode}
                    makeVisible={!selectedEpisodeIsLive ? makeVisible : null}
                    initialDisplay={initialDisplay}
                    onEpisodePlay={this.onEpisodePlay}
                    onEpisodePause={this.onEpisodePause}
                />
            </>
        )
    }

    render() {
        return (
            <div className="episodes-player">
                {this.renderPlayer()}
                {this.renderEpisodes()}
            </div>
        )
    }
}
