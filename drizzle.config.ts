import { defineConfig } from 'drizzle-kit';
import { DatabaseConfig } from './envConfig';

export default defineConfig({
    out: './drizzle',
    schema: './src/models/*',
    dialect: 'postgresql',
    dbCredentials: {
        url: DatabaseConfig.connectUrl
    }
});
