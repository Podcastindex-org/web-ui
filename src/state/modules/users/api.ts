import { ApiBase } from '../_abstract/api';

export class UsersApi extends ApiBase {
    constructor() {
        super('users');
    }
}

export default new UsersApi();
