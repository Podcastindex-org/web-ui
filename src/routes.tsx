import * as React from 'react'
import { Route, Switch } from 'react-router-dom'

import Landing from './pages/landing'

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
    //     path: '/stats',
    //     name: 'Dashboards',
    //     icon: 'TIMELINE_AREA_CHART',
    //     topbar: () => <div>Other links</div>,
    //     component: Dashboards,
    //     routes: [],
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
        <Route path="/" component={Landing} />
        <Route component={() => <div>Not Found</div>} />
    </Switch>
)

export default Routes
