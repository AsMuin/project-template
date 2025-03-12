import { SecretKey } from '@env';
import jwt from 'jsonwebtoken';

function generateAccessToken(user: { id: number }): string {
    return jwt.sign({ userId: user.id }, SecretKey, { expiresIn: '15m' });
}

function generateRefreshToken(user: { id: number }): string {
    return jwt.sign({ userId: user.id }, SecretKey, { expiresIn: '30d' });
}

function verifyToken(token: string) {
    return jwt.verify(token, SecretKey);
}

export { generateAccessToken, generateRefreshToken, verifyToken };
