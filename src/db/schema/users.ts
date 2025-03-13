import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';

const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 256 }).notNull(),
    email: varchar('email', { length: 256 }).notNull().unique(),
    avatarUrl: varchar('avatar_url', { length: 256 }),
    passwordHash: varchar('password_hash', { length: 256 }).notNull()
});

const usersSelectValidation = createSelectSchema(users);
const usersInsertValidation = createInsertSchema(users);
const usersUpdateValidation = createUpdateSchema(users);

export { usersSelectValidation, usersInsertValidation, usersUpdateValidation };

export default users;
