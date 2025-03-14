import { SecretKey } from '@env';
import { RefreshPayload, UserPayload } from '@type';
import jwt from 'jsonwebtoken';

function generateAccessToken(user: UserPayload): string {
    return jwt.sign({ id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl } as UserPayload, SecretKey, {
        expiresIn: '15m'
    });
}

function generateRefreshToken(user: RefreshPayload): string {
    return jwt.sign({ userId: user.id }, SecretKey, { expiresIn: '30d' });
}

function verifyToken(token: string): UserPayload | RefreshPayload {
    return jwt.verify(token, SecretKey) as UserPayload | RefreshPayload;
}

export { generateAccessToken, generateRefreshToken, verifyToken };
