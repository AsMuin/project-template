import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import { type IResponse } from '@repo/types';

interface IRequestConfig extends AxiosRequestConfig {
    toastError?: boolean;
    _retry?: boolean;
}

interface IAxiosError<T = unknown, D = any> extends AxiosError<T, D> {
    config: IRequestConfig & InternalAxiosRequestConfig<D>;
}

/* 
T 接口返回数据类型
D 接口请求参数类型
*/
interface ResponseParams<T = any, D = any> extends AxiosResponse<T, D> {
    config: InternalAxiosRequestConfig<D> & IRequestConfig;
}

export const axiosInstance = axios.create({
    baseURL: '/api'
});
const refreshAccessTokenUrl = '/auth/refresh-accessToken';

let isRefreshing = false;
let failedQueue: Array<(token: string | null, error: Error | null) => void> = [];

//无需任何处理的接口
// const noCheckRequestList: string[] = ['/auth/register', '/auth/login', '/auth/refresh-accessToken', '/auth/logout'];

function processQueue(error: Error | null, token: string | null) {
    failedQueue.forEach(callback => {
        if (error) {
            callback(null, error);
        } else if (token) {
            callback(token, null);
        }
    });

    failedQueue = [];
}

//请求处理
axiosInstance.interceptors.request.use(async (config: InternalAxiosRequestConfig & IRequestConfig) => {
    config._retry ??= false;

    // if (!noCheckRequestList.includes(config.url || '')) {
    //     // 处理验证token
    //     const accessToken = getAccessToken();

    //     if (accessToken) {
    //         config.headers['Authorization'] = `Bearer ${accessToken}`;
    //     }
    // }

    return config;
});

//响应处理
axiosInstance.interceptors.response.use(
    // 响应成功回调
    (response: ResponseParams<IResponse, any>) => {
        const {
            data: { success, message }
        } = response;

        // 服务端成功响应了数据,但是业务结果是失败的
        if (!success) {
            const toastError = response.config.toastError ?? true;

            if (toastError) {
                toast.error(message);
            }

            throw new Error(message);
        }

        return response;
    },
    //响应失败回调
    async (error: IAxiosError) => {
        const originalRequest = error.config;

        if (originalRequest) {
            // 判断是否是更新认证token失败，如果是的话两个 token 全部失效，直接登出

            if (originalRequest.url === refreshAccessTokenUrl && error.response?.status === 401) {
                // 标记为不再更新认证token，防止其他请求继续等待
                isRefreshing = false;
                // 清空等待队列
                processQueue(new Error('Session expired, please login again.'), null);
                // // 提示用户并执行登出
                // toast.error('登录信息已过期，请重新登录');
                // logout();

                return Promise.reject(error);
            }

            // 判断是否因为认证token过期导致失败
            if (error.response?.status === 401 && !originalRequest._retry) {
                // 标记为重试请求（再失败直接判断非法错误）
                originalRequest._retry = true;

                if (isRefreshing) {
                    // 如果正在更新认证token，返回一个promise，这个promise会在更新完成后执行
                    return new Promise(function (resolve, reject) {
                        failedQueue.push((token: string | null, error: Error | null) => {
                            if (token) {
                                originalRequest.headers['Authorization'] = 'Bearer ' + token;
                                resolve(axiosInstance(originalRequest));
                            } else if (error) {
                                reject(error);
                            }
                        });
                    });
                } else {
                    //设定正在更新认证token
                    isRefreshing = true;

                    try {
                        const newAccessToken = await refreshAccessToken();

                        // 更新成功，执行队列中的并发请求
                        processQueue(null, newAccessToken);

                        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                        return axiosInstance(originalRequest);
                    } catch (e: any) {
                        processQueue(e as Error, null);

                        return Promise.reject(e);
                    } finally {
                        isRefreshing = false;
                    }
                }
            }
        }

        return Promise.reject(error);
    }
);

// 登出注销
export function logout() {
    axiosInstance
        .post('/auth/logout')
        .catch(err => {
            console.error('Logout failed:', err);
        })
        .finally(() => {
            removeAccessToken();
        });
}

// 刷新认证token
async function refreshAccessToken() {
    const response = await axiosInstance.get(refreshAccessTokenUrl);
    const {
        data: { data: accessToken = '' }
    } = response;

    saveAccessToken(accessToken);

    return accessToken as string;
}

export async function Request<Data = any, IsQueryData extends boolean = false>(requestConfig: IRequestConfig, extraConfig?: IRequestConfig) {
    const Response = await axiosInstance.request<IResponse<Data, IsQueryData>>({ ...requestConfig, ...extraConfig });

    return Response.data;
}

interface IRequestDataProcessing<Params, ResponseData> {
    beforeRequest?: (params: Params, extraConfig?: IRequestConfig) => Params;
    afterResponse?: (response: IResponse<ResponseData>) => IResponse<any>;
}

export class BaseRequest<Params extends Record<string, any> | undefined, ResponseData = any, IsQueryData extends boolean = false> {
    constructor(
        private config:
            | (IRequestConfig & IRequestDataProcessing<Params, ResponseData>)
            | ((params: Params) => IRequestConfig & IRequestDataProcessing<Params, ResponseData>)
    ) {
        this.request = this.request.bind(this);
        this.getQueryFn = this.getQueryFn.bind(this);
    }

    public request<RD = ResponseData>(
        ...args: undefined extends Params
            ? [requestParams?: Params, extraConfig?: IRequestConfig]
            : [requestParams: Params, extraConfig?: IRequestConfig]
    ): Promise<IResponse<RD, IsQueryData>>;
    public request<RD = ResponseData>(requestParams?: Params, extraConfig?: IRequestConfig): Promise<IResponse<RD, IsQueryData>> {
        let requestParamsCopy = requestParams && structuredClone(requestParams);

        const config = typeof this.config === 'function' ? this.config(requestParams as Params) : this.config;

        if (config.beforeRequest && requestParamsCopy) {
            const beforeRequestResult = config.beforeRequest(requestParamsCopy, extraConfig);

            if (beforeRequestResult) {
                requestParamsCopy = beforeRequestResult;
            }
        }

        const finalConfig = {
            ...config,
            ...extraConfig
        };

        if (extraConfig?.signal) {
            finalConfig.signal = extraConfig.signal;
        }

        const method = finalConfig.method?.toUpperCase() || 'GET';

        if (method === 'GET') {
            finalConfig.params = requestParamsCopy || requestParams;
        } else {
            finalConfig.data = requestParamsCopy || requestParams;
        }

        if (finalConfig.afterResponse) {
            finalConfig.transformResponse = [finalConfig.afterResponse];
        }

        return Request<RD, IsQueryData>(finalConfig);
    }

    public getQueryFn({ queryKey, signal }: { queryKey: [string, Params] | [string]; signal: AbortSignal }) {
        return (this.request as any)(queryKey[1], { signal });
    }
}

function saveAccessToken(token: string) {
    sessionStorage.setItem('accessToken', token);
}

export function getAccessToken() {
    return sessionStorage.getItem('accessToken');
}

function removeAccessToken() {
    sessionStorage.removeItem('accessToken');
}
