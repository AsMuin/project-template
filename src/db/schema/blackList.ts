import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';

const blackList = pgTable('refresh_tokens_blacklist', {
    token: varchar('token', { length: 256 }).primaryKey(),
    expiresAt: timestamp('expires_at').notNull()
});

const blackListSelectValidation = createSelectSchema(blackList);
const blackListInsertValidation = createInsertSchema(blackList);
const blackListUpdateValidation = createUpdateSchema(blackList);

export {
    blackListSelectValidation,
    blackListInsertValidation,
    blackListUpdateValidation
}

export default blackList;