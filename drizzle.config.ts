import { defineConfig } from 'drizzle-kit';
import { DatabaseConfig } from './envConfig';

console.log({
    url: DatabaseConfig.connectUrl
});

export default defineConfig({
    out: './drizzle',
    schema: './src/db/schema/*',
    dialect: 'postgresql',
    dbCredentials: {
        url: DatabaseConfig.connectUrl
    }
});
