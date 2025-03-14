import db from '@/db';
import blackList, { blackListInsertValidation } from '@/db/schema/blackList';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, verifyToken } from '@/utils/auth';
import { RefreshPayload, UserPayload } from '@type';
import responseBody from '@/config/response';
import { UnauthorizedError } from '@/config/error';
import { addUser, findUser, isTokenBlacklisted } from '@/services/auth';
import RequestHandler from '@/config/requestHandler';

//注册
const register = RequestHandler(async (req, res) => {
    const { name, email, password }: { name: string; email: string; password: string } = req.body;

    const user = await findUser({ email });

    if (user) {
        throw new UnauthorizedError('邮箱已注册');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await addUser({ name, email, passwordHash });

    return res.json(responseBody(true, '注册成功'));
});

// 登录
const login = RequestHandler(async (req, res) => {
    const { email, password }: { email: string; password: string } = req.body;

    const user = await findUser({ email });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        throw new UnauthorizedError('用户名或密码错误');
    }

    const payload: UserPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie('refresh_token', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict' });

    return res.json(
        responseBody(true, '获取Token', {
            data: accessToken
        })
    );
});

// 登出
const logout = RequestHandler(async (req, res) => {
    const refreshToken = req.cookies.refresh_token as string;

    if (!refreshToken) {
        throw new UnauthorizedError('无刷新令牌');
    }

    const parsedData = blackListInsertValidation.parse({
        token: refreshToken,
        expiresAt: new Date()
    });

    await db.insert(blackList).values(parsedData);

    res.clearCookie('refresh_token');

    return res.json(responseBody(true, '退出成功'));
});

// 验证身份状态
const validateAuth = RequestHandler(async (req, res) => {
    const user = req.user;

    if (!user || !user.id || !user.email) {
        throw new UnauthorizedError('无效的令牌');
    }

    const result = await findUser({
        id: user.id,
        email: user.email
    });

    if (!result) {
        throw new UnauthorizedError('用户不存在');
    }

    return res.json(responseBody(true, '验证成功', { data: user }));
});

// 刷新令牌
const refreshToken = RequestHandler(async (req, res) => {
    const refreshToken = req.cookies.refresh_token as string;

    if (!refreshToken || (await isTokenBlacklisted(refreshToken))) {
        throw new UnauthorizedError('无效的刷新令牌');
    }

    const decodedToken = verifyToken(refreshToken) as RefreshPayload;

    if (!decodedToken) {
        throw new UnauthorizedError('令牌过期');
    }

    // 获取用户
    const user = await findUser({
        id: decodedToken.id
    });

    if (!user) {
        throw new UnauthorizedError('用户不存在');
    }

    const newAccessToken = generateAccessToken(user);

    return res.json(responseBody(true, '刷新Token', { data: newAccessToken }));
});

export { register, login, logout, refreshToken, validateAuth };
