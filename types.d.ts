declare global {
    interface IResponse<T = unknown, IsQueryData extends boolean = false> {
        success: boolean;
        message: string;
        data: T;
        total: IsQueryData extends true ? number : undefined;
        pageIndex: IsQueryData extends true ? number : undefined;
        limit: IsQueryData extends true ? number : undefined;
    }
    interface Window {
        __TANSTACK_QUERY_CLIENT__: import('@tanstack/query-core').QueryClient;
    }
}
export {}; // 确保此文件被作为模块处理，以避免全局声明冲突
