import express from 'express';
import dotenv from 'dotenv';
import connectToMongoDB from './src/config/mongoDB';
import fs from 'fs';

// 加载 .env 文件中的环境变量
if (fs.existsSync('.env.local')) {
    dotenv.config({ path: '.env.local' });
}
dotenv.config();

//服务配置
const app = express();
const port = process.env.PORT || 3222;
connectToMongoDB();

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//路由

app.listen(port, () => {
    console.log(`Server running on  http://localhost:${port} 🎉🎉🎉🎉`);
});
