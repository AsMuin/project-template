import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export default pgTable('refresh_tokens_blacklist', {
    id: uuid('id').primaryKey().notNull(),
    token: varchar('token', { length: 256 }).notNull().unique(),
    expiresAt: timestamp('expires_at').notNull()
});
