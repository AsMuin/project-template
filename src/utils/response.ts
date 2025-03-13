import { IResponse } from '@type';
import { validatorNoEmpty } from './validator';

const responseBody =
    <T = unknown>(success: boolean, message: string, returnInfo?: { data: T; total?: number; pageIndex?: number; limit?: number }) => {
        const responseBody: IResponse<T> = {
            success,
            message,
        };

        if (returnInfo?.data) {
            responseBody.data = returnInfo.data;
        }
        if (validatorNoEmpty(returnInfo?.total) && validatorNoEmpty(returnInfo?.pageIndex) && validatorNoEmpty(returnInfo?.limit)) {
            responseBody.total = returnInfo?.total;
            responseBody.pageIndex = returnInfo?.pageIndex;
            responseBody.limit = returnInfo?.limit;
        }

        return responseBody;
    };

export default responseBody;
