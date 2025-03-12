import { Response } from 'express';

interface IResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
}

const apiResponse =
    (response: Response) =>
    <T = any>(success: boolean, message: string, returnInfo?: { data: T }) => {
        const responseBody: IResponse<T> = {
            success,
            message
        };

        if (returnInfo?.data) {
            responseBody.data = returnInfo.data;
        }

        response.json(responseBody);

        return responseBody;
    };

export default apiResponse;
