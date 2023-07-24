import * as React from 'react'
import { Link } from "react-router-dom";
import { getISODate, getPrettyDate, truncateString } from '../../utils'

import Value from '../Value'
import Comments from '../Comments'
import NoImage from '../../../images/no-cover-art.png'
import PlayLogo from '../../../images/play-circle.svg'
import PauseLogo from '../../../images/pause-circle.svg'
import EarthLogo from '../../../images/earth.svg'
import DownloadLogo from '../../../images/download-outline.svg'
import TranscriptLogo from '../../../images/transcript.svg'
import LinkLogo from '../../../images/link.svg'

import './styles.scss'

interface IProps {
    id: number,
    feedId: number,
    index?: number
    title?: string
    image?: any
    link?: string,
    value?: any,
    enclosureUrl?: string,
    transcriptUrl?: string, //csbdev
    description?: string
    datePublished?: number
    hasComments: boolean
    startTime?: number
    onPlay?: any
    onPause?: any
}

export default class EpisodeItem extends React.PureComponent<IProps> {
    state = {
        playing: false,
        playButtonSrc: PlayLogo,
    }

    constructor(props) {
        super(props)
        // fix this in handlers
        this.togglePlayPause = this.togglePlayPause.bind(this)
    }

    setPlaying(playing: boolean) {
        let button = PlayLogo
        if (playing) {
            button = PauseLogo
        }
        this.setState({
            playing: playing,
            playButtonSrc: button,
        })
    }

    togglePlayPause() {
        if (this.state.playing) {
            if (this.props.onPause) {
                this.props.onPause()
            }
            this.pause()
        } else {
            if (this.props.onPlay) {
                this.props.onPlay(this.props.index)
            }
            this.play()
        }
    }

    play() {
        this.setState({
            playing: true,
            playButtonSrc: PauseLogo,
        })
    }

    pause() {
        this.setState({
            playing: false,
            playButtonSrc: PlayLogo,
        })
    }

    render() {
        const {
            id,
            feedId,
            title,
            image,
            link,
            value,
            enclosureUrl,
            transcriptUrl,
            description,
            datePublished,
            hasComments,
            startTime,
        } = this.props
        const episodeLink = link
        const episodeEnclosure = enclosureUrl
        const episodeTranscript = transcriptUrl

        return (
            <div className="episode" id={`${id}`}>
                <div className="episode-row">
                    <div className="episode-cover-art">
                        <img
                            alt="Episode cover art"
                            draggable={false}
                            src={image}
                            onError={(ev: any) => {
                                ev.target.src = NoImage
                            }}
                            loading="lazy"
                        />
                    </div>
                    <div className="episode-info">
                        <div className="episode-title">{title}</div>
                        <p className="episode-date">
                            {startTime ? (
                                <time dateTime={getISODate(startTime)}>
                                    {getPrettyDate(startTime)}
                                </time>
                            ) : (
                                <time dateTime={getISODate(datePublished)}>
                                    {getPrettyDate(datePublished)}
                                </time>
                            )}
                        </p>

                        <div className="episode-links">
                            {episodeLink ?
                                <a
                                    className="episode-link"
                                    href={episodeLink}
                                    title="Episode Website"
                                    target="_blank"
                                >
                                    <img
                                        alt="Episode Website"
                                        src={EarthLogo}/>
                                </a>
                                : ""
                            }

                            {episodeEnclosure ?
                                <a
                                    className="episode-link"
                                    href={episodeEnclosure}
                                    title="Download"
                                    target="_blank"
                                >
                                    <img
                                        alt="Download Episode"
                                        src={DownloadLogo}/>
                                </a>
                                : ""
                            }

                            {episodeTranscript ?
                                <a
                                    className="episode-link"
                                    href={episodeTranscript}
                                    title="Transcript"
                                    download
                                >
                                    <img
                                        alt="Download Transcript"
                                        src={TranscriptLogo}/>
                                </a>
                                : ""
                            }

                            <Link
                                className="episode-id-link"
                                to={`/podcast/${feedId}?episode=${id}`}
                                title="Episode Link on Podcast Index"
                            >
                                <img
                                    alt={`Link to ${title} on Podcast Index`}
                                    src={LinkLogo}/>
                            </Link>

                            <img
                                alt="Play/pause episode"
                                className="episode-play-pause-mobile"
                                src={this.state.playButtonSrc}
                                onClick={this.togglePlayPause}/>
                        </div>
                    </div>
                    <img
                        alt="Play/pause episode"
                        className="episode-play-pause"
                        src={this.state.playButtonSrc}
                        onClick={this.togglePlayPause}/>
                </div>
                <p className="episode-description">
                    {truncateString(description).replace(/(<([^>]+)>)/gi, " ")}
                </p>
                {value && <Value {...value} />}
                {hasComments && <Comments id={id}/>}
            </div>
        )
    }
}
