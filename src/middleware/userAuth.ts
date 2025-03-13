import { verifyToken } from '@/utils/auth';
import { validatorNoEmpty } from '@/utils/validator';
import { UnauthorizedError } from '@/config/error'; // 引入自定义错误类
import { UserPayload } from '@type';
import RequestHandler from '@/config/requestHandler';

const authenticateToken = RequestHandler((req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        throw new UnauthorizedError('缺少认证令牌');
    }

    const user = verifyToken(token) as UserPayload;

    if (!validatorNoEmpty(user)) {
        throw new UnauthorizedError('无效的认证令牌');
    }

    // 将用户信息附加到请求对象上
    req.user = user;
    next();
});

export default authenticateToken;
