import * as React from 'react'
import { Route, Switch } from 'react-router-dom'

import Landing from './pages/landing'
import Results from './pages/results'

type RouteType = {
    path: string
    name: string
    exact?: boolean
    icon?: string
    topbar?: Function
    component?: any
    routes: Array<any>
}

export const routes: Array<RouteType> = [
    // {
    //     path: '/',
    //     exact: false,
    //     name: 'Home',
    //     component: Main,
    //     routes: [
    //         {
    //             path: '/',
    //             exact: true,
    //             name: 'Home',
    //             component: Landing,
    //         },
    //         {
    //             path: '/search',
    //             exact: true,
    //             name: 'Search',
    //             component: Results,
    //         },
    //     ],
    // },
]

export function RouteWithSubRoutes(route: RouteType) {
    return (
        <Route
            path={route.path}
            render={(props) => (
                <route.component {...props} routes={route.routes} />
            )}
        />
    )
}

const Routes: React.SFC = () => (
    <Switch>
        {/* <Route path="/" component={Main} /> */}
        <Route exact path="/" component={Landing} />
        <Route exact path="/search" component={Results} />
        <Route component={() => <div>Not Found</div>} />
    </Switch>
)

export default Routes
