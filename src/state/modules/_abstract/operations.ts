import shortid from 'shortid';
import { Dispatch, AnyAction } from 'redux'
import { ThunkDispatch } from 'redux-thunk'
import { ApiBase } from './api';

export const operations = (creators, api: ApiBase, additionalOperations: object = {}) => {
    const index = (ids?: string) => {
        return (dispatch) => {
            dispatch(creators.indexRequest(ids));
            return api
                .index(ids)
                .then(
                    (models) => dispatch(creators.indexSuccess(models)),
                    (errors) => dispatch(creators.indexFailure(errors)),
                );
        };
    };

    const create = (form) => {
        const tempId = shortid.generate(); // need this to keep track of the created object
        return (dispatch: Dispatch) => {
            dispatch(creators.createRequest(form, tempId));
            return api
                .create(form)
                .then(
                    (model) => dispatch(creators.createSuccess(model, tempId)),
                    (errors) => dispatch(creators.createFailure(errors, tempId)),
                );
        };
    };

    const destroy = (id) => {
        return (dispatch: Dispatch) => {
            dispatch(creators.destroyRequest(id));
            return api
                .destroy(id)
                .then(
                    (response) => dispatch(creators.destroySuccess(id, response)),
                    (errors) => dispatch(creators.destroyFailure(id, errors)),
                );
        };
    };

    const show = (id) => {
        return (dispatch: Dispatch) => {
            dispatch(creators.showRequest(id));
            return api
                .show(id)
                .then(
                    (model) => dispatch(creators.showSuccess(id, model)),
                    (errors) => dispatch(creators.showFailure(id, errors)),
                );
        };
    };

    const update = (id, form) => {
        return (dispatch: Dispatch) => {
            dispatch(creators.updateRequest(id, form));
            return api
                .update(id, form)
                .then(
                    (model) => dispatch(creators.updateSuccess(id, model)),
                    (errors) => dispatch(creators.updateFailure(id, errors)),
                );
        };
    };

    const reset = () => (dispatch: Dispatch) => dispatch(creators.reset());
    const resetErrors = () => (dispatch: Dispatch) => dispatch(creators.resetErrors());

    return {
        index,
        create,
        destroy,
        show,
        update,
        reset,
        resetErrors,
        ...additionalOperations,
    }
};

export default operations;

export * from './reducer';
export * from './schema';
