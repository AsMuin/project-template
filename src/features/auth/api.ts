import { BaseRequest } from '../../lib/request';
import { loginParams, registerParams } from './validator';

const baseURL = '/auth';

const login = new BaseRequest<loginParams>({
    method: 'post',
    url: `${baseURL}/login`
});

const registry = new BaseRequest<registerParams>({
    method: 'post',
    url: `${baseURL}/register`
});

const validateAuth = new BaseRequest<undefined>({
    method: 'get',
    url: `${baseURL}/validate-auth`
});

export { login, registry, validateAuth };
