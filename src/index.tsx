import * as React from 'react'
import * as ReactDOM from 'react-dom'
import store, { history } from './state/store'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import { Store } from 'redux'
import { History } from 'history'

import Topbar from './components/TopBar'
import Routes from './routes'

import LandingBG from '../images/landing-bg.svg'
import './styles.scss'

import { ApplicationState } from './state/store'

interface MainProps {
    store: Store<ApplicationState>
    history: History
}

const Index: React.FC<MainProps> = ({ store, history }) => {
    return (
        <Provider store={store}>
            <ConnectedRouter history={history}>
                <div className="page">
                    <Topbar />
                    <img
                        draggable="false"
                        className="landing-graphic"
                        height={1017}
                        width={1017}
                        src={LandingBG}
                        alt="Sidebar logo"
                    />
                    <Routes />
                </div>
            </ConnectedRouter>
        </Provider>
    )
}

ReactDOM.render(
    <Index store={store} history={history} />,
    document.getElementById('root')
)
