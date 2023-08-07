import * as React from "react";
import EpisodesPlayer from "../EpisodesPlayer";

import './styles.scss'

interface IProps {
    episodes: Array<{}>
    initialDisplay?: number
}

export default class ResultsEpisodes extends React.PureComponent<IProps> {
    state = {
        selectedEpisode: Object(),
    }
    _isMounted = false

    constructor(props) {
        super(props)
    }

    async componentDidMount(): Promise<void> {
        this._isMounted = true
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    render() {
        const {episodes, initialDisplay} = this.props
        const {selectedEpisode} = this.state

        const podcast = {
            id: selectedEpisode.feedId,
            url: selectedEpisode.feedUrl,
            author: selectedEpisode.feedAuthor,
            title: selectedEpisode.feedTitle,
            language: selectedEpisode.feedLanguage,
            medium: "podcast", // for search results, don't want sort
        }

        return (
            <div className="results-episodes">
                <EpisodesPlayer
                    podcast={podcast}
                    episodes={{items: episodes}}
                    initialDisplay={initialDisplay}
                />
            </div>
        )
    }
}
