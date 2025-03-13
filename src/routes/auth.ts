import express from 'express';
import multer from '@/middleware/multer';
import userAuth from '@/middleware/userAuth';

const authRouter = express.Router();

authRouter.get('/demo', userAuth, multer.single('image'), (req, res) => {
    res.send('Hello World!');
});

export default authRouter;
