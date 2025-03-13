import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export default pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 256 }).notNull(),
    email: varchar('email', { length: 256 }).notNull().unique(),
    avatarUrl: varchar('avatar_url', { length: 256 }),
    passwordHash: varchar('password_hash', { length: 256 }).notNull()
});
