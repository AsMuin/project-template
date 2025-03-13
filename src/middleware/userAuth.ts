import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@/utils/auth';
import { validatorNoEmpty } from '@/utils/validator';
import { UnauthorizedError } from '@/config/error'; // 引入自定义错误类
import { UserPayload } from '@type';

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next(new UnauthorizedError('缺少认证令牌'));
    }

    try {
        const user = verifyToken(token) as UserPayload;

        if (!validatorNoEmpty(user)) {
            throw new UnauthorizedError('无效的认证令牌');
        }

        // 将用户信息附加到请求对象上
        req.user = user;
        next();
    } catch (error) {
        next(error); // 将错误传递给全局错误处理器
    }
};

export default authenticateToken;