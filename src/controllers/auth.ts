import db from '@/db';
import { eq, lt } from 'drizzle-orm/expressions';
import users from '@/db/schema/users';
import blackList from '@/db/schema/blackList';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, verifyToken } from '@/utils/auth';
import { ControllerAction, RefreshPayload, UserPayload } from '@type';
import responseBody from '@/config/response';
import { BadRequestError, UnauthorizedError } from '@/config/error';

// 登录
const login: ControllerAction = async (req, res, next) => {
    try {
        const { email, password }: { email: string, password: string } = req.body;

        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
            columns: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                passwordHash: true,
            }
        });

        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            throw new UnauthorizedError('用户名或密码错误');
        }

        const payload: UserPayload = {
            id: user.id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        res.cookie('refresh_token', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict' });
        return res.json(responseBody(true, '获取Token', {
            data: accessToken,
        }));
    } catch (error) {
        next(error)
    }
};

// 登出
const logout: ControllerAction = async (req, res, next) => {

    try {
        const refreshToken = req.cookies.refresh_token as string;

        if (!refreshToken) {
            throw new BadRequestError('无刷新令牌')
        }

        await db.insert(blackList).values({
            token: refreshToken,
            expiresAt: new Date(),
        });

        res.clearCookie('refresh_token');
        return res.json(responseBody(true, '退出成功'));
    } catch (error) {
        next(error)
    }

};

// 刷新令牌
const refreshToken: ControllerAction = async (req, res, next) => {

    try {
        const refreshToken = req.cookies.refresh_token as string;

        if (!refreshToken || await isTokenBlacklisted(refreshToken)) {
            throw new UnauthorizedError('无效的刷新令牌');
        }

        const decodedToken = verifyToken(refreshToken) as RefreshPayload;
        if (!decodedToken) {
            throw new UnauthorizedError('令牌过期');
        }

        // 获取用户
        const user = await db.query.users.findFirst({
            where: eq(users.id, decodedToken.id),
            columns: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
            }
        })
        if (!user) {
            throw new UnauthorizedError('用户不存在');
        }
        const newAccessToken = generateAccessToken(user);

        return res.json({ accessToken: newAccessToken });
    } catch (error) {
        next(error)
    }

};

// 验证令牌黑名单
async function isTokenBlacklisted(token: string): Promise<boolean> {
    try {
        const now = new Date();
        await db.delete(blackList)
            .where(lt(blackList.expiresAt, now))

        const result = await db.query.blackList.findFirst({
            where: eq(blackList.token, token),
        })

        return result ? true : false;

    } catch (error) {
        return false;
    }

}

export {
    login,
    logout,
    refreshToken,
}