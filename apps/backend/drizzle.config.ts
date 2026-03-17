import { defineConfig } from 'drizzle-kit';
import { DATABASE_CONFIG } from './env.config';

export default defineConfig({
    out: './drizzle',
    schema: './src/models/*',
    dialect: 'sqlite',
    dbCredentials: {
        url: DATABASE_CONFIG.connectUrl
    }
});
