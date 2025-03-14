import db from '@/db';
import blackList from '@/db/schema/blackList';
import users from '@/db/schema/users';
import { queryFilter } from '@/utils/query';
import { and, eq, lt } from 'drizzle-orm';

//新增用户
function addUser({ name, email, avatarUrl, passwordHash }: { name: string; email: string; avatarUrl?: string; passwordHash: string }) {
    return db.insert(users).values({
        name,
        email,
        avatarUrl,
        passwordHash
    });
}

//检索用户
function findUser({ id, email }: { id?: string; email?: string }) {
    const filterMap = {
        id: (value: string) => eq(users.id, value),
        email: (value: string) => eq(users.email, value)
    };
    const filter = queryFilter(filterMap, { id, email });

    return db.query.users.findFirst({
        where: and(...filter),
        columns: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            passwordHash: true
        }
    });
}

//清空无效黑名单
function deleteBlackList() {
    const now = new Date();

    db.delete(blackList).where(lt(blackList.expiresAt, now));
}

//检查黑名单
async function isTokenBlacklisted(token: string) {
    const result = await db.query.blackList.findFirst({
        where: eq(blackList.token, token)
    });

    return result ? true : false;
}

//添加到黑名单
function addBlackRecord(token: string) {
    db.insert(blackList).values({
        token,
        expiresAt: new Date()
    });
}

export { findUser, deleteBlackList, isTokenBlacklisted, addBlackRecord, addUser };
