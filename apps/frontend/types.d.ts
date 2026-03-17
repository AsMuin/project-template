declare global {
    interface Window {
        __TANSTACK_QUERY_CLIENT__: import('@tanstack/query-core').QueryClient;
    }
    type WorkerOutputMessage = { type: 'progress'; percentage: number } | { type: 'finish'; hash: string };
}
export {}; // 确保此文件被作为模块处理，以避免全局声明冲突
