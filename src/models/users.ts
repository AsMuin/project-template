import { pgTable, uuid, varchar, pgEnum } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';

// 引入或定义你的枚举类型
export const userRoleEnum = pgEnum('user_role', ['admin', 'user']); // 确保与你在数据库中创建的枚举类型匹配

const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 256 }).notNull(),
    email: varchar('email', { length: 256 }).notNull().unique(),
    avatarUrl: varchar('avatar_url', { length: 256 }),
    passwordHash: varchar('password_hash', { length: 256 }).notNull(),
    roles: userRoleEnum('roles').array().notNull().default(['user'])
});

const usersSelectValidation = createSelectSchema(users);
const usersInsertValidation = createInsertSchema(users);
const usersUpdateValidation = createUpdateSchema(users);

export { usersSelectValidation, usersInsertValidation, usersUpdateValidation };

export default users;
