import express from 'express';
import multer from '@/middleware/multer';
import userAuth from '@/middleware/userAuth';

const demoRouter = express.Router();

demoRouter.get('/demo', userAuth, multer.single('image'), (req, res) => {
    res.send('Hello World!');
});

export default demoRouter;
