import express from 'express';
import cookieParser from 'cookie-parser';
import errorHandler from '@/middleware/errorHandler';
import { PORT } from 'env.config';
import { createServer } from 'http';

//服务配置
const app: express.Application = express();
// const baseUrl = BASE_URL || '/api';

const httpServer = createServer(app);

// 中件
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
//路由
// app.use(`${baseUrl}/hotspots`, hotspotRouter);
// app.use(`${baseUrl}/keywords`, keywordRouter);
// app.use(`${baseUrl}/notifications`, notificationRouter);
// app.use(`${baseUrl}/settings`, settingRouter);

// 错误处理(必须放在所有路由的最后)
app.use(errorHandler);

httpServer.listen(PORT, () => {
    console.log(`
  📡 Server running on http://localhost:${PORT}
  `);
});
