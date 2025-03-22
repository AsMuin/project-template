import { drizzle } from 'drizzle-orm/neon-http';
import { dataBaseConfig } from '@env';
import users from '@/db/schema/users';
import accounts from '@/db/schema/accounts';
import verificationTokens from '@/db/schema/verificationTokens';
// import * as relationList from '@/db./relations';

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
