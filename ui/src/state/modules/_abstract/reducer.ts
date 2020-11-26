import { Reducer, AnyAction } from 'redux'
import { BaseState } from './schema';
import pluralize from 'pluralize';

// Type-safe initialState!
export const INITIAL_STATE: BaseState = {
    data: [],
    errors: undefined,
    loading: false,
    hydrated: false
}


export const createBaseHandlers = (name: string, actions: object, Types: any) => {
    const requestReducer: Reducer<BaseState> = (state: BaseState, action: AnyAction) => {
        return { ...state, loading: true };
    }
    const successReducer: Reducer<BaseState> = (state: BaseState, action: AnyAction) => {
        console.log('reducer hit', action)
        return { ...state, loading: false, hydrated: true, data: action[pluralize(name)] }
    }
    const errorReducer: Reducer<BaseState> = (state: BaseState, action: AnyAction) => {
        console.log('reducer hit', action)
        return { ...state, loading: false, hydrated: true, errors: action.payload }
    }
    const reset = () => INITIAL_STATE;
    const resetErrors = (state: BaseState = INITIAL_STATE) => ({ ...state, errors: {} });
    return {
        [Types.CREATE_REQUEST]: requestReducer,
        [Types.CREATE_FAILURE]: errorReducer,
        [Types.CREATE_SUCCESS]: successReducer,
        [Types.DESTROY_REQUEST]: requestReducer,
        [Types.DESTROY_FAILURE]: errorReducer,
        [Types.DESTROY_SUCCESS]: successReducer,
        [Types.SHOW_REQUEST]: requestReducer,
        [Types.SHOW_FAILURE]: errorReducer,
        [Types.SHOW_SUCCESS]: successReducer,
        [Types.UPDATE_REQUEST]: requestReducer,
        [Types.UPDATE_FAILURE]: errorReducer,
        [Types.UPDATE_SUCCESS]: successReducer,
        [Types.INDEX_REQUEST]: requestReducer,
        [Types.INDEX_FAILURE]: errorReducer,
        [Types.INDEX_SUCCESS]: successReducer,
        [Types.RESET]: reset,
        [Types.RESET_ERRORS]: resetErrors,
    };
};

export default { createBaseHandlers };
