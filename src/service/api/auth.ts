import { RequestConstructor } from '.';
import { loginParams, registerParams } from '../validator';

const baseURL = '/auth';

const login = RequestConstructor<loginParams>({
    method: 'post',
    url: `${baseURL}/login`
});

const registry = RequestConstructor<registerParams>({
    method: 'post',
    url: `${baseURL}/registry`
});

export { login, registry };
