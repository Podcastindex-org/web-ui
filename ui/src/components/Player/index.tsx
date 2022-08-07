import * as React from 'react'
import AudioPlayer from 'react-h5-audio-player'
import sha256 from 'crypto-js/sha256'
import { AUDIO_PRELOAD_ATTRIBUTE } from 'react-h5-audio-player/src/constants'
import { v4 as uuidv4 } from 'uuid'
import { Link } from 'react-router-dom'
import { getISODate, getPrettyDate } from '../../utils'
import { requestProvider } from 'webln'
import confetti from 'canvas-confetti'

import 'react-h5-audio-player/src/styles.scss'
import './styles.scss'

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
        satAmount: 100,
        boostagram: '',
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
        this.setMediaSessionActionHandlers()
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

    handleSatChange = (e: any) => {
        this.setState({
            satAmount: e.target.validity.valid
                ? e.target.value
                : this.state.satAmount,
        })
    }

    handleTextAreaChange = (e: any) => {
        this.setState({
            boostagram: e.target.value,
        })
    }

    boost = async () => {
        const { episode, podcast } = this.props
        let webln
        let destinations =
            episode?.value?.destinations || podcast?.value?.destinations

        const getBaseRecord = () => {
            return {
                podcast: podcast?.title,
                feedID: podcast?.id,
                itemID: episode?.id,
                episode: episode?.title,
                ts: Math.trunc(this.player.current.audio.current.currentTime),
                action: 'boost',
                app_name: 'Podcast Index',
                value_msat: 0,
                value_msat_total: this.state.satAmount * 1000,
                name: undefined,
                message: this.state.boostagram,
            }
        }

        let feesDestinations = destinations.filter((v) => v.fee)
        let splitsDestinations = destinations.filter((v) => !v.fee)
        let runningTotal = this.state.satAmount

        try {
            webln = await requestProvider()
        } catch (err) {
            // Tell the user what went wrong
            alert(
                `${err.message} \r\n Try using Alby ( https://getalby.com/ ) on the Desktop \r\n or installing Blue Wallet ( https://bluewallet.io/ ) \r\n or Blixt Wallet ( https://blixtwallet.github.io/ )  \r\n on your mobile device.`
            )
        }

        if (webln) {
            this.throwConfetti()
            for (const dest of feesDestinations) {
                let feeRecord = getBaseRecord()

                let amount = Math.round(
                    (dest.split / 100) * this.state.satAmount
                )
                if (amount) {
                    runningTotal -= amount
                    feeRecord.name = dest.name
                    feeRecord.value_msat = amount * 1000

                    let customRecords = { '7629169': JSON.stringify(feeRecord) }

                    if (dest.customKey) {
                        customRecords[dest.customKey] = dest.customValue
                    }

                    try {
                        await webln.keysend({
                            destination: dest.address,
                            amount: amount,
                            customRecords: customRecords,
                        })
                    } catch (err) {
                        alert(`error with  ${dest.name}:  ${err.message}`)
                    }
                }
            }

            for (const dest of splitsDestinations) {
                let record = getBaseRecord()
                let amount = Math.round((dest.split / 100) * runningTotal)
                record.name = dest.name
                record.value_msat = amount * 1000
                if (amount >= 1) {
                    let customRecords = { '7629169': JSON.stringify(record) }
                    if (dest.customKey) {
                        customRecords[dest.customKey] = dest.customValue
                    }

                    try {
                        await webln.keysend({
                            destination: dest.address,
                            amount: amount,
                            customRecords: customRecords,
                        })
                    } catch (err) {
                        alert(`error with  ${dest.name}:  ${err.message}`)
                    }
                }
            }
        }
    }

    throwConfetti() {
        let end = Date.now() + 0.1 * 1000

        let colors = [
            '#fa6060',
            '#faa560',
            '#faf760',
            '#b2fa60',
            '#60c1fa',
            '#7260fa',
            '#fa60f2',
        ]

        ;(function frame() {
            confetti({
                particleCount: 12,
                angle: 60,
                spread: 75,
                origin: { x: 0, y: 0.9 },
                colors: colors,
            })
            confetti({
                particleCount: 12,
                angle: 120,
                spread: 75,
                origin: { x: 1, y: 0.9 },
                colors: colors,
            })

            if (Date.now() < end) {
                requestAnimationFrame(frame)
            }
        })()
    }

    render() {
        const { episode, preload } = this.props

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
                <div className="boostagram-corner">
                    <textarea
                        value={this.state.boostagram}
                        onChange={this.handleTextAreaChange}
                        placeholder="type your boostagram here"
                    />
                    <label>
                        <input
                            type="text"
                            pattern="[0-9]*"
                            value={this.state.satAmount}
                            onChange={this.handleSatChange}
                            onFocus={(e) => e.target.select()}
                        />
                        sats
                    </label>
                    <button onClick={this.boost}>Boost</button>
                </div>
            </div>
        )
    }
}
