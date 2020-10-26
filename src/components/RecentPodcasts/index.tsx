import * as React from 'react'
import ReactLoading from 'react-loading'

import Player from "../Player";
import BackIcon from '../../../images/chevron-back-outline.svg'
import NoImage from '../../../images/no-cover-art.png'
import ForwardIcon from '../../../images/chevron-forward-outline.svg'
import 'react-h5-audio-player/src/styles.scss'
import './styles.scss'
import {Link} from "react-router-dom";

interface IProps {
    title?: string
    podcasts?: Array<any>
    loading?: boolean
}

interface IState {
    index: number
}

export default class RecentPodcasts extends React.Component<IProps, IState> {
    static defaultProps = {}
    state = {
        index: 0,
    }

    constructor(props: IProps) {
        super(props)
    }

    selectPodcast(index: number, evt) {
        evt.stopPropagation()
        evt.preventDefault()
        this.setState({index})
    }

    onBack() {
        const {index} = this.state
        const {podcasts} = this.props
        let backIndex = index - 1
        if (backIndex < 0) {
            backIndex = podcasts.length - 1
        }
        this.setState({
            index: backIndex,
        })
    }

    onForward() {
        const {index} = this.state
        const {podcasts} = this.props
        let nextIndex = index + 1
        if (nextIndex >= podcasts.length) {
            nextIndex = 0
        }
        this.setState({
            index: nextIndex,
        })
    }

    render() {
        const {loading, title, podcasts} = this.props
        const {index} = this.state
        const selectedPodcast = podcasts[index]
        return (
            <div className="player-card">
                {loading ? (
                    <div className="loader-wrapper">
                        <ReactLoading type="cylon" color="#e90000"/>
                    </div>
                ) : (
                    <div className="player">
                        <div className="player-nav-arrows">
                            <button
                                className="player-nav-arrows-left"
                                onClick={this.onBack.bind(this)}
                            >
                                <img src={BackIcon} height={20}/>
                            </button>
                            <button
                                className="player-nav-arrows-right"
                                onClick={this.onForward.bind(this)}
                            >
                                <img src={ForwardIcon} height={20}/>
                            </button>
                        </div>
                        {title && (
                            <div className="player-title">
                                <b>{title}</b>
                            </div>
                        )}
                        <div className="player-cover-art">
                            <Link to={`/podcast/${selectedPodcast.feedId}`}>
                                <img
                                    draggable={false}
                                    src={selectedPodcast.image || selectedPodcast.feedImage || NoImage}
                                    onError={(ev: any) => {
                                        ev.target.src = NoImage
                                    }}
                                />
                            </Link>
                        </div>
                        <div className="player-bottom">
                            <div className="player-carousel">
                                {podcasts.map((podcast, i) => (
                                    <button
                                        aria-label={podcast.title}
                                        key={`${i}`}
                                        className={`player-carousel-item ${
                                            i === index ? 'selected' : ''
                                        }`}
                                        onClick={this.selectPodcast.bind(
                                            this,
                                            i
                                        )}
                                    ></button>
                                ))}
                            </div>
                            <Player episode={selectedPodcast}/>
                        </div>
                    </div>
                )}
            </div>
        )
    }
}
