declare global {
    interface IResponse<T = unknown> {
        success: boolean;
        message: string;
        data: T;
        total?: number;
        pageIndex?: number;
        limit?: number;
    }
    interface Window {
        __TANSTACK_QUERY_CLIENT__: import('@tanstack/query-core').QueryClient;
    }
}
export {}; // 确保此文件被作为模块处理，以避免全局声明冲突
