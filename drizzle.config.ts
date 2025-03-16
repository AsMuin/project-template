import { defineConfig } from 'drizzle-kit';
import { dataBaseConfig } from '@env';

export default defineConfig({
    out: './drizzle',
    schema: './src/db/schema/*',
    dialect: 'postgresql',
    dbCredentials: {
        url: dataBaseConfig.url!
    }
});
