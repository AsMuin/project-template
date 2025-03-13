import express from 'express';
import { login, logout, refreshToken } from '@/controllers/auth';

const authRouter = express.Router();

authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/refresh-token', refreshToken);

export default authRouter;
