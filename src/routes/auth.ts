import express from 'express';
import userAuth from '@/middleware/userAuth';
import { login, logout, refreshToken, validateAuth } from '@/controllers/auth';

const authRouter = express.Router();

authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/refresh-accessToken', refreshToken);
authRouter.get('/validate-auth', userAuth, validateAuth);

export default authRouter;
