import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { showMessage } from '@/components/MessageManager';
interface IResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    token?: string;
}

export interface IQueryList<T> {
    itemList: T;
}
export interface IRequestConfig extends AxiosRequestConfig {
    toastError?: boolean;
}
export interface IResponseParams<T = any, D = any> extends AxiosResponse<T, D> {
    config: InternalAxiosRequestConfig & IRequestConfig;
}
const axiosInstance = axios.create({
    baseURL: '/api'
});

//无需登录验证的接口
const noAuthRequestList: string[] = [];

axiosInstance.interceptors.request.use(async (config: InternalAxiosRequestConfig & IRequestConfig) => {
    try {
        if (noAuthRequestList.includes(config.url || '')) {
            return config;
        } else {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('请先登录');
                // 权限认证失败的情况下
                showMessage({ type: 'warning', message: '请先登录' });
                return Promise.reject('请先登录');
            } else {
                config.headers.Authorization = token;
                return config;
            }
        }
    } catch (e: any) {
        console.error(e);
        showMessage({ type: 'error', message: e.message || e });
        return Promise.reject(e);
    }
});

axiosInstance.interceptors.response.use(async (response: IResponseParams<IResponse, any>) => {
    try {
        const { data } = response;
        if (data.success) {
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            return response;
        } else {
            const toastError = response.config.toastError ?? true;
            // 服务端响应了数据,但是处理结果是失败的
            if (toastError) {
                showMessage({ type: 'error', message: data.message });
            }
            return Promise.reject(data.message);
        }
    } catch (e: any) {
        console.error(e);
        return Promise.reject(e);
    }
});

export async function Request<T = any>(requestConfig: IRequestConfig, extraConfig?: IRequestConfig): Promise<IResponse<T>> {
    try {
        const Response = await axiosInstance.request<IResponse<T>>({ ...extraConfig, ...requestConfig });
        return Response.data;
    } catch (e: any) {
        // 某种原因请求发送失败 比如网络断开
        console.error(e);
        // showMessage({ type: 'error', message: e.message || e });
        return Promise.reject(e);
    }
}

interface IRequestDataProcessing<T, R> {
    beforeRequest?: (params: T, extraConfig?: IRequestConfig) => T | void;
    afterResponse?: (response: IResponse<R>) => IResponse<any> | void;
}

const RequestConstructor =
    <T = any, RD = any>(config: IRequestConfig, requestDataProcessing?: IRequestDataProcessing<T, RD>) =>
        <R>(requestParams: T, extraConfig?: IRequestConfig) => {
            let requestParamsCopy = structuredClone(requestParams);
            if (requestDataProcessing?.beforeRequest) {
                const beforeRequestResult = requestDataProcessing.beforeRequest(requestParamsCopy, extraConfig);
                if (beforeRequestResult) {
                    requestParamsCopy = beforeRequestResult;
                }
            }
            if (requestDataProcessing?.afterResponse) {
                config.transformResponse = [requestDataProcessing.afterResponse];
            }
            if (config.method === 'get' || config.method === 'GET' || !config.method) {
                return Request<R>({ ...config, params: requestParamsCopy || requestParams }, extraConfig);
            } else {
                return Request<R>({ ...config, data: requestParamsCopy || requestParams }, extraConfig);
            }
        };

export default RequestConstructor;
