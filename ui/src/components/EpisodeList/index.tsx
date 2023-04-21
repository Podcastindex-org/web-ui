import * as React from 'react'
import EpisodeItem from '../EpisodeItem'
import InfiniteList from '../InfiniteList'
import { fixURL, getImage } from '../../utils'

const he = require('he')

interface IProps {
    title: string
    podcast: any
    episodes: Array<Object>
    playingEpisode: Object
    onEpisodePlay: Function
    onEpisodePause: Function
}

export default class EpisodeList extends React.PureComponent<IProps> {
    state = {
        index: 0,
    }
    episodeItems: any[] = []

    constructor(props) {
        super(props)
        this.onEpisodePlay = this.onEpisodePlay.bind(this)
        this.onEpisodePause = this.onEpisodePause.bind(this)
        this.renderEpisode = this.renderEpisode.bind(this)
    }

    async componentDidUpdate(prevProps) {
        const { episodes, playingEpisode } = this.props

        this.episodeItems.forEach((episodeItem, index) => {
            episodeItem.current.setPlaying(
                playingEpisode == episodes[index]
            )
        })
    }

    onEpisodePlay(index: number) {
        // trigger the callback to play the episode
        this.props.onEpisodePlay(this.props.episodes[index])
    }

    onEpisodePause() {
        // trigger the callback to pause the episode
        this.props.onEpisodePause()
    }

    renderEpisode(item, index: number) {
        let {
            id,
            title,
            link,
            enclosureUrl,
            transcriptUrl,
            description,
            datePublished,
            value,
            socialInteract,
            startTime
        } = item
        let {podcast} = this.props
        // try to use episode image, fall back to feed images
        const image = getImage(item) || getImage(podcast)
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
                    id={id}
                    index={index}
                    title={title}
                    image={image}
                    link={link}
                    value={value}
                    enclosureUrl={enclosureUrl}
                    transcriptUrl={transcriptUrl}
                    description={description}
                    datePublished={datePublished}
                    hasComments={socialInteract && socialInteract.length > 0}
                    startTime={startTime}
                    onPlay={this.onEpisodePlay}
                    onPause={this.onEpisodePause}
                />
            </div>
        )
    }

    render() {
        const { title, episodes } = this.props

        return (
            <div className="episodes-list">
                <h2 className="episode-header">{title}</h2>
                <InfiniteList
                    data={episodes}
                    itemRenderer={this.renderEpisode}
                />
            </div>
        )
    }
}
