import * as React from 'react'
import {Route, Switch} from 'react-router-dom'
import {updateTitle} from '../../utils'
import PodcastInfo from './PodcastInfo'
import Value4Value from "./Value4Value";

import './styles.scss'

interface IProps {
    match: any
}

export default class Podcast extends React.PureComponent<IProps> {
    render() {
        updateTitle('Podcast')
        return (
            <div>
                <Switch>
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
                        exact
                        path={`${this.props.match.path}/value4value`}
                        render={(props) => <Value4Value {...props} />}
                    />
                    <Route
                        path={`${this.props.match.path}/:podcastId`}
                        render={(props) => <PodcastInfo {...props} />}
                    />
                </Switch>
            </div>
        )
    }
}
