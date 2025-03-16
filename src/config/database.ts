import { drizzle } from 'drizzle-orm/node-postgres';
import { DatabaseConfig } from '../../envConfig';
import users from '@/models/users';
import blackList from '@/models/blackList';

const db = drizzle(DatabaseConfig.connectUrl, {
    schema: {
        blackList,
        users
    },
    logger: true
});

export default db;
