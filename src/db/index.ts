import { drizzle } from 'drizzle-orm/neon-http';
import { dataBaseConfig } from '../../envConfig';
import users from './schema/users';
import accounts from './schema/accounts';
import verificationTokens from './schema/verificationTokens';
// import * as relationList from './relations';

// 数据库配置(提供TS类型支持)
const db = drizzle(dataBaseConfig.url!, {
    schema: {
        users,
        accounts,
        verificationTokens
        // ...relationList
    },
    logger: true
});

export default db;
