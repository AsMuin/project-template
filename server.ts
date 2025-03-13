import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from '@/routes/auth';
import errorHandler from '@/middleware/errorHandler';

//服务配置
const app: express.Application = express();
const port = process.env.PORT || 3222;
const baseUrl = process.env.BASE_URL || '/api';

// 中间件
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
//路由
app.use(`${baseUrl}/auth`, authRouter);

//错误处理
app.use(errorHandler)

app.listen(port, () => console.log(`Server running on  http://localhost:${port} 🎉🎉🎉🎉`));
