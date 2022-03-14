import * as React from 'react'
import { Fragment } from 'react'
import { Route, Switch } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import AddFeed from './pages/AddFeed'
import Apps from './pages/Apps'
import DonationThankYou from './pages/Donations'

import Landing from './pages/Landing'
import Podcast from './pages/Podcast'
import Search from './pages/Search'
import Stats from './pages/Stats'
import { history } from './state/store'

const Routes: React.FunctionComponent = () => (
    <Fragment>
        <ScrollToTop />
        <Switch>
            <Route exact path="/" render={() => <Landing />} />
            <Route
                path="/search"
                render={(props) => <Search {...props} history={history} />}
            />
            <Route path="/thankyou" component={DonationThankYou} />
            <Route exact path="/stats" render={() => <Stats />} />

            <Route path="/podcast" component={Podcast} />

            <Route path="/apps" component={Apps} />

            <Route path="/add" component={AddFeed} />

            <Route component={() => <div>Not Found</div>} />
        </Switch>
    </Fragment>
)

export default Routes
