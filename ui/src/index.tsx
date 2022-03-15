import * as React from 'react'
import * as ReactDOM from 'react-dom'
import store, { history } from './state/store'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import { Store } from 'redux'
import { History } from 'history'

import TopBar from './components/TopBar'
import BottomBar from './components/BottomBar'
import Routes from './routes'

import './styles.scss'

import { ApplicationState } from './state/store'
import { Container } from 'react-bootstrap'

interface MainProps {
    store: Store<ApplicationState>
    history: History
}

const Index: React.FC<MainProps> = ({ store, history }) => {
    return (
        <Provider store={store}>
            <ConnectedRouter history={history}>
                <header>
                    <Container>
                        <TopBar history={history} />
                    </Container>
                </header>
                <main className="pb-4">
                    <Container>
                        <Routes />
                    </Container>
                </main>
                <footer className="footer mt-auto bg-light py-4">
                    <Container>
                        <BottomBar />
                    </Container>
                </footer>
            </ConnectedRouter>
        </Provider>
    )
}

ReactDOM.render(
    <Index store={store} history={history} />,
    document.getElementById('root')
)
