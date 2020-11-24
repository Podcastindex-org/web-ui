import * as React from 'react'
import { Route } from 'react-router-dom'
import PodcastInfo from './PodcastInfo'
import { updateTitle } from '../../utils'

import './styles.scss'

interface IProps {
    match: any
}

export default class Podcast extends React.PureComponent<IProps> {
    render() {
        updateTitle('Podcast')
        return (
            <div>
                <Route
                    exact
                    path={this.props.match.path}
                    render={() => (
                        <div className="page-content">
                            <h1>Podcasts</h1>
                            <p>Please search for a podcast above</p>
                        </div>
                    )}
                />
                <Route
                    path={`${this.props.match.path}/:podcastId`}
                    render={(props) => <PodcastInfo {...props} />}
                />
            </div>
        )
    }
}
