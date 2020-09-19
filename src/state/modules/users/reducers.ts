import { createReducer } from 'reduxsauce';
import { createBaseHandlers, BaseState } from '../_abstract';
import { Creators, Types } from './actions';

const INITIAL_STATE: BaseState = {
    data: [],
    errors: undefined,
    loading: false,
    hydrated: false
}

// ---------------- CREATE REDUCERS ----------------

const crudReducers = createBaseHandlers('users', Creators, Types);

// const customHandler = (state, { tab }) => crudReducers[Types.INDEX_SUCCESS](state, { data: null });

const additionalReducers = {
    // [Types.CUSTOM_TYPE_REQUEST]: crudReducers[Types.INDEX_REQUEST]
    // [Types.CUSTOM_TYPE_SUCCESS]: customHandler,
    // [Types.CUSTOM_TYPE_ERROR]: crudReducers[Types.INDEX_ERROR]
};

export default createReducer(INITIAL_STATE, { ...crudReducers, ...additionalReducers });