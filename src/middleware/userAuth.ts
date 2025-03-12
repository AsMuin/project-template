import { ControllerAction } from '@type';
import { verifyToken } from '@/utils/auth';
import { validatorNoEmpty } from '@/utils/validator';

// 中间件：检查身份验证
const authenticateToken: ControllerAction = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401);
    }

    const user = verifyToken(token);

    if (!validatorNoEmpty(user)) {
        return res.sendStatus(403);
    }

    req.body.user = user;

    next();
};

export default authenticateToken;
