import { omitUndefined, validatorNoEmpty } from '@/utils/common';
import { type IResponse } from '@repo/types';

const responseBody = <T = unknown>(success: boolean, message: string, returnInfo?: { data: T; total?: number; page?: number; limit?: number }) => {
    const isQuery = validatorNoEmpty(returnInfo?.total) && validatorNoEmpty(returnInfo?.page) && validatorNoEmpty(returnInfo?.limit);
    const responseBody = isQuery
        ? {
              success,
              message,
              total: returnInfo?.total,
              page: returnInfo?.page,
              limit: returnInfo?.limit,
              data: returnInfo?.data
          }
        : {
              success,
              message,
              data: returnInfo?.data
          };

    return omitUndefined(responseBody) as IResponse<T, typeof isQuery>;
};

export default responseBody;
