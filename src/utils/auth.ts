import { SecretKey } from '@env';
import jwt from 'jsonwebtoken';

function generateAccessToken(user: UserPayload): string {
    return jwt.sign({ id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl, roles: user.roles } as UserPayload, SecretKey, {
        expiresIn: '15m'
    });
}

function generateRefreshToken(user: RefreshPayload): string {
    return jwt.sign({ userId: user.id }, SecretKey, { expiresIn: '30d' });
}

function verifyToken(token: string): UserPayload | RefreshPayload {
    return jwt.verify(token, SecretKey) as UserPayload | RefreshPayload;
}

function getJwtExpiry(token: string) {
    // 将JWT字符串分割成它的三个组成部分
    const base64Url = token.split('.')[1]; // 获取payload部分
    // 将base64url编码的payload转换为base64编码，以供解码
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    // 解码payload并将其解析为JSON对象
    const payload = JSON.parse(atob(base64));
    // 返回过期时间
    return payload.exp as number; // exp是以秒为单位的Unix时间戳
}

export { generateAccessToken, generateRefreshToken, verifyToken, getJwtExpiry };
