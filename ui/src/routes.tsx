import * as React from 'react'
import { Route, Switch } from 'react-router-dom'
import { history } from './state/store'

import Landing from './pages/landing'
import Search from './pages/Search'
import Stats from './pages/Stats'
import DonationThankYou from './pages/Donations'
import Podcast from './pages/Podcast'
import Apps from './pages/Apps'
import AddFeed from "./pages/AddFeed";

const Routes: React.FunctionComponent = () => (
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
)

export default Routes
