import * as React from 'react'
import AudioPlayer from 'react-h5-audio-player'
import sha256 from 'crypto-js/sha256'
import { AUDIO_PRELOAD_ATTRIBUTE } from 'react-h5-audio-player/src/constants'
import { v4 as uuidv4 } from 'uuid'
import { Link } from 'react-router-dom'
import { getISODate, getPrettyDate } from '../../utils'

import 'react-h5-audio-player/src/styles.scss'
import './styles.scss'

import Boostagram from '../Boostagram'

interface IProps {
    episode?: any
    podcast?: any
    onPlay?: any
    onPause?: any
    onCanPlay?: any
    preload?: AUDIO_PRELOAD_ATTRIBUTE
}

export default class Player extends React.Component<IProps> {
    static defaultProps = {
        preload: 'none',
    }
    state = {
        playing: false,
        satAmount: 5000,
        boostagram: '',
        destinations: undefined,
    }

    player = React.createRef<AudioPlayer>()

    constructor(props: IProps) {
        super(props)
        // fix this in handlers
        this.onCanPlay = this.onCanPlay.bind(this)
        this.onPlay = this.onPlay.bind(this)
        this.onPause = this.onPause.bind(this)
    }

    onCanPlay() {
        if (this.props.onCanPlay) {
            this.props.onCanPlay()
        }
    }

    play() {
        this.player.current.audio.current.play()
    }

    pause() {
        this.player.current.audio.current.pause()
    }

    onPlay() {
        if (this.props.onPlay) {
            this.props.onPlay()
        }
        this.setState({
            playing: true,
        })
    }

    onPause() {
        if (this.props.onPause) {
            this.props.onPause()
        }
        this.setState({
            playing: false,
        })
    }

    componentDidMount() {
        const { episode, podcast } = this.props
        this.setMediaSessionActionHandlers()
        this.setState({
            destinations:
                episode?.value?.destinations || podcast?.value?.destinations,
        })
    }

    componentDidUpdate() {
        this.setMediaSessionMetadata()
    }

    setMediaSessionActionHandlers() {
        let navigator: any = window.navigator
        if ('mediaSession' in window.navigator) {
            navigator.mediaSession.setActionHandler('seekbackward', () =>
                this.seekBackward()
            )
            navigator.mediaSession.setActionHandler('seekforward', () =>
                this.seekForward()
            )
        }
    }

    seekBackward() {
        let audio = this.player.current.audio.current
        audio.currentTime = Math.max(0, audio.currentTime - 5)
    }

    seekForward() {
        let audio = this.player.current.audio.current
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 5)
    }

    setMediaSessionMetadata() {
        let navigator: any = window.navigator
        let episode = this.props.episode
        let image: string = episode.image || episode.feedImage
        if (episode && 'mediaSession' in window.navigator) {
            // @ts-ignore
            navigator.mediaSession.metadata = new MediaMetadata({
                title: episode.title,
                artist: episode.feedTitle,
                ...(image && {
                    artwork: [{ src: image, sizes: '512x512' }],
                }),
            })
        }
    }

    render() {
        const { episode, podcast, preload } = this.props

        //See if a pciguid exists in local storage.  They are stored using a hash of the enclosure url as the key to avoid
        //character encoding issues with what browsers accept as a valid key.  If the value exists, get it.  If not, create
        //a new on and store it for potential use later if this enclosure is played again by this user
        let enclosureHash = sha256(episode.enclosureUrl)
        let pciStatsGuid = localStorage.getItem(enclosureHash)
        if (pciStatsGuid === null) {
            pciStatsGuid = uuidv4()
            localStorage.setItem(enclosureHash, pciStatsGuid)
        }

        //Attach the pciguid value to the end of the enclosure url as a query parameter to pass back to the host/cdn for
        //anonymous, yet reliable tracking stats
        let pciGuid = ''
        if (episode.enclosureUrl.indexOf('?') > -1) {
            pciGuid = '&_ulid=' + pciStatsGuid
        } else {
            pciGuid = '?_ulid=' + pciStatsGuid
        }

        //Tag a _from on the end to give a stats hint
        let fromTag = '&_from=podcastindex.org'
        if (episode.enclosureUrl.indexOf('_from=') > -1) {
            fromTag = ''
        }

        //Assemble the new url
        let enclosureUrl = episode.enclosureUrl + pciGuid + fromTag

        return (
            <div className="player-media-controls">
                <AudioPlayer
                    ref={this.player}
                    header={
                        <div className="player-info">
                            <div className="player-show-title">
                                <p title={episode.title}>{episode.title}</p>
                            </div>
                            <div className="player-podcast-name">
                                {episode.feedTitle !== undefined ? (
                                    <Link
                                        to={`/podcast/${episode.feedId}`}
                                        title={episode.feedTitle}
                                    >
                                        {`from: ${episode.feedTitle}`}
                                    </Link>
                                ) : (
                                    ''
                                )}
                            </div>
                            <p>
                                <time
                                    dateTime={getISODate(episode.datePublished)}
                                >
                                    {getPrettyDate(episode.datePublished)}
                                </time>
                            </p>
                        </div>
                    }
                    autoPlayAfterSrcChange={false}
                    autoPlay={false}
                    src={enclosureUrl}
                    onCanPlay={this.onCanPlay}
                    onPlay={this.onPlay}
                    preload={preload}
                    onPause={this.onPause}
                    onEnded={this.onPause}
                    customAdditionalControls={[
                        <a
                            className="player-feed-button"
                            // href={}
                            style={{ width: 30 }}
                        >
                            {/* <img src={FeedIcon} /> */}
                        </a>,
                    ]}
                />
                <Boostagram
                    episode={episode}
                    podcast={podcast}
                    player={this.player}
                />
            </div>
        )
    }
}
