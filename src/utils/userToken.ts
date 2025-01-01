import jwt from 'jsonwebtoken';
function createToken(id: string) {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '24h' });
}
function verifyToken(token: string) {
    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET as string);
        return token_decode;
    } catch (e: any) {
        throw new Error(e.message);
    }
}
export { createToken, verifyToken };
