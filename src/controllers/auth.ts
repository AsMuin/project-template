import db from '@/db';
import blackList, { blackListInsertValidation } from '@/db/schema/blackList';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, verifyToken } from '@/utils/auth';
import { ControllerAction, RefreshPayload, UserPayload } from '@type';
import responseBody from '@/config/response';
import { BadRequestError, UnauthorizedError } from '@/config/error';
import { findUser, isTokenBlacklisted } from '@/services/auth';

// 登录
const login: ControllerAction = async (req, res, next) => {
    try {
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
    } catch (error) {
        next(error);
    }
};

// 登出
const logout: ControllerAction = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refresh_token as string;

        if (!refreshToken) {
            throw new BadRequestError('无刷新令牌');
        }

        const parsedData = blackListInsertValidation.parse({
            token: refreshToken,
            expiresAt: new Date()
        });

        await db.insert(blackList).values(parsedData);

        res.clearCookie('refresh_token');

        return res.json(responseBody(true, '退出成功'));
    } catch (error) {
        next(error);
    }
};

// 刷新令牌
const refreshToken: ControllerAction = async (req, res, next) => {
    try {
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

        return res.json({ accessToken: newAccessToken });
    } catch (error) {
        next(error);
    }
};

export { login, logout, refreshToken };
