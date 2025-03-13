import db from '@/db';
import blackList from '@/db/schema/blackList';
import users from '@/db/schema/users';
import { queryFilter } from '@/utils/pageQuery';
import { and, eq, lt } from 'drizzle-orm';

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

function deleteBlackList() {
    const now = new Date();

    db.delete(blackList).where(lt(blackList.expiresAt, now));
}

async function isTokenBlacklisted(token: string) {
    const result = await db.query.blackList.findFirst({
        where: eq(blackList.token, token)
    });

    return result ? true : false;
}

function addBlackRecord(token: string) {
    db.insert(blackList).values({
        token,
        expiresAt: new Date()
    });
}

export { findUser, deleteBlackList, isTokenBlacklisted, addBlackRecord };
