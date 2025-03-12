// src/schema.ts
import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export default pgTable('users', {
    id: uuid('id').primaryKey().notNull(),
    username: varchar('username', { length: 256 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 256 }).notNull()
});
