import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@/utils/userToken';
import apiResponse from '@/utils/response';
function userAuth(req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers;
    if (!authorization) {
        apiResponse(res)(false, '缺少用户凭证');
        return;
    }
    try {
        const token_decode: any = verifyToken(authorization);
        req.body.userId = token_decode.id;
        next();
    } catch (e: any) {
        console.error(e);
        apiResponse(res)(false, e.message);
    }
}
export default userAuth;
