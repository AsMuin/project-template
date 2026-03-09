import { validatorNoEmpty } from '../lib/utils/pattern';

const responseBody = <T = unknown>(success: boolean, message: string, returnInfo?: { data: T; total?: number; page?: number; limit?: number }) => {
    const responseBody: IResponse<T> = {
        success,
        message
    };

    if (returnInfo?.data) {
        responseBody.data = returnInfo.data;
    }

    if (validatorNoEmpty(returnInfo?.total) && validatorNoEmpty(returnInfo?.page) && validatorNoEmpty(returnInfo?.limit)) {
        responseBody.total = returnInfo?.total;
        responseBody.page = returnInfo?.page;
        responseBody.limit = returnInfo?.limit;
    }

    return responseBody;
};

export default responseBody;
