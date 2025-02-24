export interface IResponse<T = unknown> {
    success: boolean;
    message: string;
    data: T;
    total?: number;
    pageIndex?: number;
    limit?: number;
}
