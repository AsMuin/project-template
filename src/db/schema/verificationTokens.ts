import { pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';

export default pgTable(
    'verificationToken',
    {
        identifier: text('identifier').notNull(),
        token: text('token').notNull(),
        expires: timestamp('expires', { mode: 'date' }).notNull()
    },
    verificationToken => [primaryKey({ name: 'compositePk', columns: [verificationToken.identifier, verificationToken.token] })]
);
