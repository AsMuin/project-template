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
export interface IResponseParams<T = any, D = any> extends AxiosResponse<T, D> {
    config: InternalAxiosRequestConfig & IRequestConfig;
}
const axiosInstance = axios.create({
    baseURL: '/api'
});

//无需任何处理的接口
const noCheckRequestList: string[] = [];

axiosInstance.interceptors.request.use(async (config: InternalAxiosRequestConfig & IRequestConfig) => {
    try {
        if (noCheckRequestList.includes(config.url || '')) {
            return config;
        } else {
            /* something */
            return config;
        }
    } catch (e: any) {
        console.error(e);

        return Promise.reject(e);
    }
});

axiosInstance.interceptors.response.use(async (response: IResponseParams<IResponse, any>) => {
    try {
        const { data } = response;

        if (data.success) {
            return response;
        } else {
            const toastError = response.config.toastError ?? true;

            // 服务端响应了数据,但是处理结果是失败的
            if (toastError) {
                toast.error(data.message);
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
        console.error(e);

        return Promise.reject(e);
    }
}

interface IRequestDataProcessing<P, RD> {
    beforeRequest?: (params: P, extraConfig?: IRequestConfig) => P | void;
    afterResponse?: (response: IResponse<RD>) => IResponse<any> | void;
}

const RequestConstructor =
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

export default RequestConstructor;
