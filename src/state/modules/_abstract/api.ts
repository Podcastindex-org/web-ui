/**
 * Api base class
 */
export class ApiBase {
    module: string;
    legacy: boolean;
    private endpoint: string;
    config: object;
    constructor(
        moduleName,
        legacy = false,
        config: ApiConfig = {
            index: true,
            create: true,
            update: true,
            show: true,
            destroy: true,
        },
    ) {
        this.module = moduleName;
        this.legacy = legacy;
        // Create https://api.dearduck.lvh.me/{moduleName}
        this.endpoint = `${legacy ? 'http://localhost:9001' : 'http://localhost:9001'}/${moduleName}`;
        // Optional to turn it off.
        this.index = config.index ? this.index : null;
        this.create = config.create ? this.create : null;
        this.update = config.update ? this.update : null;
        this.show = config.show ? this.show : null;
        this.destroy = config.destroy ? this.destroy : null;
    }

    request = (route: string, payload: FetchBody = { method: 'GET' }, responseType: ResponseType = 'json'): Promise<any> => {
        if (!payload.headers) payload.headers = {};
        payload.headers['Access-Control-Allow-Origin'] = '*';
        // payload.mode = 'no-cors';
        // $FlowFixMe
        // const publicToken = store.getState().login.access_token;
        const authorization = localStorage.getItem('access_token');
        // const headers = new Headers({ authorization });
        if (authorization) payload.headers.Authorization = `JWT ${authorization}`;
        if (payload.headers['Content-Type'] === 'multipart/form-data') {
            delete payload.headers['Content-Type'];
        }
        return fetch(route, payload)
            .then(this.checkStatus)
            .then((response: HttpResponse) => {
                return responseType === 'json' ? this.parseJSON(response) : response.text();
            });
    };

    checkStatus = async (response: Response) => {
        if (response.status >= 200 && response.status < 300) return response;
        const error: any = new Error(`HTTP Error ${response.statusText}`);
        error.status = response.statusText;
        error.response = response.statusText;
        const body = await response.json();
        if (body.errorCode) error.code = body.errorCode;
        throw error;
    };

    parseJSON = (response) => {
        return response.json();
    };

    index = (ids): Promise<any> => this.request(`${this.endpoint}`, { method: 'GET' });
    create = (obj) => this.request(this.endpoint, { method: 'POST', body: obj });
    update = (id, obj) => this.request(`${this.endpoint}/${id}`, { method: 'PUT', body: obj });
    show = (id) => this.request(`${this.endpoint}/${id}`, { method: 'GET' });
    destroy = (id) => this.request(`${this.endpoint}/${id}`, { method: 'DELETE' });
}
// -- Type Definitions
type ResponseType = 'json' | 'plain';

type ApiConfig = {
    index: boolean,
    create: boolean,
    update: boolean,
    show: boolean,
    destroy: boolean,
};
type Headers = {
    Authorization?: string
}
type User = {
    token?: string
}
type FetchBody = {
    method?: string, // *GET, POST, PUT, DELETE, etc.
    // mode?: string, // no-cors, *cors, same-origin
    // cache?: string, // *default, no-cache, reload, force-cache, only-if-cached
    // credentials?: string, // include, *same-origin, omit
    headers?: Headers,
    // redirect?: string, // manual, *follow, error
    // referrerPolicy?: string, // no-referrer, *client
    body?: string // body data type must match "Content-Type" header
}
interface HttpResponse<> extends Response {
    text(): any;
    parsedBody?: string
}

type Response = {
    status?: number,
    statusText?: string,
    json(): any;
}