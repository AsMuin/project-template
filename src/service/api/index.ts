import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

interface IResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
}

export interface IQueryList<T> {
    itemList: T;
}
export interface IRequestConfig extends AxiosRequestConfig {
    toastError?: boolean;
}

/* 
T 接口返回数据类型
D 接口请求参数类型
*/
export interface IResponseParams<T = any, D = any> extends AxiosResponse<T, D> {
    config: InternalAxiosRequestConfig & IRequestConfig;
}

const axiosInstance = axios.create({
    baseURL: '/api'
});

//无需任何处理的接口
const noCheckRequestList: string[] = ['/auth/registry', '/auth/login', '/auth/refresh-accessToken', '/auth/logout'];

//请求处理
axiosInstance.interceptors.request.use(async (config: InternalAxiosRequestConfig & IRequestConfig) => {
    try {
        // 不进行任何处理的接口
        if (noCheckRequestList.includes(config.url || '')) {
            return config;
        } else {
            // 处理验证token
            let accessToken = getAccessToken();

            if (!accessToken) {
                accessToken = await refreshAccessToken();
            }

            config.headers['Authorization'] = `Bearer ${accessToken}`;

            return config;
        }
    } catch (e: any) {
        return Promise.reject(e);
    }
});

//响应处理
axiosInstance.interceptors.response.use(
    // 响应成功回调
    async (response: IResponseParams<IResponse, any>) => {
        try {
            const { data } = response;

            // 服务端成功响应了数据,但是业务结果是失败的
            if (!data.success) {
                throw new Error(data.message);
            }

            return response;
        } catch (e: any) {
            const toastError = response.config.toastError ?? true;

            if (toastError) {
                toast.error(e instanceof Error ? e.message : e);
            }

            return Promise.reject(e);
        }
    },

    //响应失败回调
    async error => {
        const originalRequest = error.config;

        // 判断是否因为token过期导致失败（还要判断是否为重试请求以及是否需要进行token检查）
        if (error.response?.status === 401 && !originalRequest._retry && !noCheckRequestList.includes(originalRequest.url || '')) {
            //标记为重试请求（再失败直接判断非法错误）
            originalRequest._retry = true;
            const newAccessToken = await refreshAccessToken();

            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

            return axiosInstance(originalRequest);
        }

        return Promise.reject(error);
    }
);

// 登出注销
export function logout() {
    axiosInstance
        .post('/auth/logout')
        .then(() => {
            removeAccessToken();
            window.location.href = '/login';
        })
        .catch(err => {
            console.error('Logout failed:', err);
            toast.error('登出失败，请稍后再试');
        });
}

// 刷新accessToken
async function refreshAccessToken() {
    try {
        const response = await axiosInstance.get('/auth/refresh-accessToken');
        const {
            data: { accessToken = '' }
        } = response;

        if (!accessToken || response.status === 401) {
            logout();
        }

        saveAccessToken(accessToken);

        return accessToken as string;
    } catch (error) {
        // refreshToken cookie 过期了，直接注销重新登录
        toast.error('登录信息已过期，请重新登录');
        removeAccessToken();
        window.location.href = '/login';

        return Promise.reject(error);
    }
}

export async function Request<T = any>(requestConfig: IRequestConfig, extraConfig?: IRequestConfig): Promise<IResponse<T>> {
    try {
        const Response = await axiosInstance.request<IResponse<T>>({ ...extraConfig, ...requestConfig });

        return Response.data;
    } catch (e: any) {
        console.error(e);

        return Promise.reject(e);
    }
}

interface IRequestDataProcessing<P, RD> {
    beforeRequest?: (params: P, extraConfig?: IRequestConfig) => P | void;
    afterResponse?: (response: IResponse<RD>) => IResponse<any> | void;
}

export const RequestConstructor =
    <P = any, R = any>(config: IRequestConfig, requestDataProcessing?: IRequestDataProcessing<P, R>) =>
    <RD = R>(requestParams: P, extraConfig?: IRequestConfig) => {
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

        const method = config.method?.toUpperCase() || 'GET';

        if (method === 'GET') {
            return Request<RD>({ ...config, params: requestParamsCopy || requestParams }, extraConfig);
        } else {
            return Request<RD>({ ...config, data: requestParamsCopy || requestParams }, extraConfig);
        }
    };

function saveAccessToken(token: string) {
    sessionStorage.setItem('accessToken', token);
}

export function getAccessToken() {
    return sessionStorage.getItem('accessToken');
}

function removeAccessToken() {
    sessionStorage.removeItem('accessToken');
}
