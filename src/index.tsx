import * as React from 'react'
import * as ReactDOM from 'react-dom'
import store, { history } from './state/store'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import { Store } from 'redux'
import { History } from 'history'

import Routes from './routes'
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
                <Routes />
            </ConnectedRouter>
        </Provider>
    )
}

ReactDOM.render(
    <Index store={store} history={history} />,
    document.getElementById('root')
)
