import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

import { DATABASE_CONFIG } from 'env.config';

const sqlite = new Database(DATABASE_CONFIG.connectUrl);
const db = drizzle(sqlite, {
    schema: {},
    logger: true
});

export default db;
