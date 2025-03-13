import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from '@/routes/auth';
import errorHandler from '@/middleware/errorHandler';
import { networkInterfaces } from 'os';

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
app.use(errorHandler);

function getLocalIP() {
    const interfaces = networkInterfaces();

    for (const interfaceName in interfaces) {
        const iface = interfaces[interfaceName];

        if (!iface) {
            continue;
        }

        for (const alias of iface) {
            if (alias.family === 'IPv4' && !alias.internal) {
                return alias.address;
            }
        }
    }

    return '127.0.0.1'; // 默认回环地址，若未找到局域网 IP 则返回此值
}

app.listen(port, () => console.log(`Server running on  http://${getLocalIP()}:${port} 🎉🎉🎉🎉`));
