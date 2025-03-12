import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { DatabaseConfig } from '../../envConfig';

const db = drizzle(DatabaseConfig.connectUrl);

export default db;
