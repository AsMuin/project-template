//统一响应数据处理
function responseBody<T = undefined>(
    success: boolean,
    message: string,
    returnInfo?: { data: T; total?: number; pageIndex?: number; limit?: number }
) {
    let response;

    if ((returnInfo?.total === 0 || returnInfo?.total) && (returnInfo?.pageIndex || returnInfo?.pageIndex === 0) && returnInfo?.limit) {
        response = {
            success,
            message,
            data: returnInfo?.data,
            total: returnInfo?.total,
            pageIndex: returnInfo?.pageIndex,
            limit: returnInfo?.limit
        };
    } else {
        response = {
            success,
            message,
            data: returnInfo?.data
        };
    }

    return response as IResponse<T>;
}

export default responseBody;
