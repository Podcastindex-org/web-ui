import { Store, combineReducers, applyMiddleware, createStore } from 'redux'
import {
    connectRouter,
    RouterState,
    routerMiddleware,
} from 'connected-react-router'
import thunkMiddleware from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import { createBrowserHistory, History } from 'history'
import { UserState, usersReducer } from './modules/users'

// The top-level state object.
//
// `connected-react-router` already injects the router state typings for us,
// so we can ignore them here.
export interface ApplicationState {
    users: UserState
    router: RouterState
}
export const history = createBrowserHistory()
// @ts-ignore: window error
const initialState = window.INITIAL_REDUX_STATE

// Whenever an action is dispatched, Redux will update each top-level application state property
// using the reducer with the matching name. It's important that the names match exactly, and that
// the reducer acts on the corresponding ApplicationState property type.
export const createRootReducer = (history: History) =>
    combineReducers({
        users: usersReducer,
        router: connectRouter(history),
    })

// create the composing function for our middlewares
const composeEnhancers = composeWithDevTools({})
const middlewares = [thunkMiddleware, routerMiddleware(history)]
// We'll create our store with the combined reducers/sagas, and the initial Redux state that
// we'll be passing from our entry point.
export default createStore(
    createRootReducer(history),
    initialState,
    composeEnhancers(applyMiddleware(...middlewares))
)
