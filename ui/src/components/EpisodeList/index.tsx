import * as React from 'react'
import { fixURL, getImage } from '../../utils'
import EpisodeItem from '../EpisodeItem'
import InfiniteList, { MakeVisibleItem } from '../InfiniteList'

const he = require('he')

interface IProps {
    title: string
    podcast: any
    episodes: Array<Object>
    playingEpisode: Object
    makeVisible?: MakeVisibleItem
    initialDisplay?: number
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
        const {episodes, playingEpisode} = this.props

        this.episodeItems.forEach((episodeItem, index) => {
            episodeItem.current?.setPlaying(
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

    renderEpisode(item, index: number, selected: boolean) {
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
            startTime,
            feedId
        } = item
        let {podcast} = this.props
        // try to use episode image, fall back to feed images
        const image = getImage(item) || getImage(podcast)
        enclosureUrl = fixURL(enclosureUrl)
        description = he.decode(description)
        const podcastId = podcast.id || feedId

        // create a reference to the generated EpisodeItem if one doesn't already exist
        if (index >= this.episodeItems.length) {
            this.episodeItems.push(React.createRef<EpisodeItem>())
        }

        return (
            <div key={index}>
                <EpisodeItem
                    ref={this.episodeItems[index]}
                    className={selected ? "selected-item" : ""}
                    id={id}
                    feedId={podcastId}
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
        const {title, episodes, makeVisible, initialDisplay} = this.props

        return (
            <div className="episodes-list">
                <h2 className="episode-header">{title}</h2>
                <InfiniteList
                    data={episodes}
                    makeVisible={makeVisible}
                    initialDisplay={initialDisplay}
                    itemRenderer={this.renderEpisode}
                />
            </div>
        )
    }
}
