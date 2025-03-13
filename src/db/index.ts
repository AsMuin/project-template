import { drizzle } from 'drizzle-orm/node-postgres';
import { DatabaseConfig } from '../../envConfig';
import { Pool } from 'pg';
import users from './schema/users';
import blackList from './schema/blackList';

const db = drizzle({
    client: new Pool({
        connectionString: DatabaseConfig.connectUrl
    }),
    schema: {
        blackList,
        users
    },
    logger: true
});

export default db;
