import { drizzle } from 'drizzle-orm/node-postgres';
import { DatabaseConfig } from '../../envConfig';
import users from './schema/users';
import blackList from './schema/blackList';

const db = drizzle(DatabaseConfig.connectUrl, {
    schema: {
        blackList,
        users
    },
    logger: true
});

export default db;
