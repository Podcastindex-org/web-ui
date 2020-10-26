import * as React from 'react'
import {Route, Switch} from 'react-router-dom'
import {history} from './state/store'

import Landing from './pages/landing'
import Results from './pages/results'
import Stats from './pages/Stats'
import DonationThankYou from './pages/donationThankYou'
import Podcast from './pages/Podcast'

const Routes: React.FunctionComponent = () => (
    <Switch>
        <Route exact path="/" render={() => <Landing/>}/>
        <Route
            path="/search"
            render={(props) => <Results {...props} history={history}/>}
        />
        <Route path="/thankyou" component={DonationThankYou}/>
        <Route exact path="/stats" render={() => <Stats/>}/>

        <Route path="/podcast" component={Podcast}/>

        <Route component={() => <div>Not Found</div>}/>
    </Switch>
)

export default Routes
