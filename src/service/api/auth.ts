import { RequestConstructor } from '.';
import { loginParams, registerParams } from '../validator';

const baseURL = '/auth';

const login = RequestConstructor<loginParams>({
    method: 'post',
    url: `${baseURL}/login`
});

const registry = RequestConstructor<registerParams>({
    method: 'post',
    url: `${baseURL}/register`
});

const validateAuth = RequestConstructor({
    method: 'get',
    url: `${baseURL}/validate-auth`
});

export { login, registry, validateAuth };
