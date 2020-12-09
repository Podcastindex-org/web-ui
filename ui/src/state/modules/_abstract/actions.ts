import { createActions } from 'reduxsauce';
import pluralize from 'pluralize';

export const createBaseActions = (name, additionalActions = {}) => {
    const moduleName = pluralize(name);
    return createActions(
        {
            indexRequest: [`${name}Ids`],
            indexSuccess: [moduleName],
            indexFailure: ['errors'],
            createRequest: [moduleName, 'tempId'],
            createSuccess: [moduleName, 'tempId'],
            createFailure: ['errors', 'tempId'],
            destroyRequest: ['id'],
            destroySuccess: ['id', 'response'],
            destroyFailure: ['id', 'errors'],
            showRequest: ['id'],
            showSuccess: ['id', moduleName],
            showFailure: ['id', 'errors'],
            updateRequest: ['id', moduleName],
            updateSuccess: ['id', moduleName],
            updateFailure: ['id', 'errors'],
            reset: [],
            resetErrors: [],
            ...additionalActions,
        },
        { prefix: `${pluralize(name).toUpperCase()}_` },
    )
}

export default { createBaseActions };
