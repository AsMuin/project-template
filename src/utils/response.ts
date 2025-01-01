import { Response } from 'express';
interface IResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    token?: string;
}
const apiResponse =
    (response: Response) =>
    <T = any>(success: boolean, message: string, returnInfo?: { data: T; token?: string }) => {
        const responseBody: IResponse<T> = {
            success,
            message,
            ...(returnInfo?.data && {
                data: returnInfo.data
            }),
            ...(returnInfo?.token && {
                token: returnInfo.token
            })
        };
        response.json(responseBody);
        return responseBody;
    };
export default apiResponse;
