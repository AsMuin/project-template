import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export default pgTable('refresh_tokens_blacklist', {
    token: varchar('token', { length: 256 }).primaryKey(),
    expiresAt: timestamp('expires_at').notNull()
});
