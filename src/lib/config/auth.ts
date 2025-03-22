import db from '@/db';
import NextAuth, { User } from 'next-auth';
import credentials from 'next-auth/providers/credentials';
import Resend from 'next-auth/providers/resend';
import { compare } from 'bcryptjs';
import { loginSchema } from '../validations';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import users from '@/db/schema/users';
import accounts from '@/db/schema/accounts';
import verificationTokens from '@/db/schema/verificationTokens';
import { selectUserByEmail } from '@/db/services/users';

export const { handlers, signIn, signOut, auth } = NextAuth({
    session: {
        strategy: 'jwt',
        updateAge: 60 * 60 * 3,
        maxAge: 60 * 60 * 24
    },
    jwt: {
        maxAge: 60 * 60 * 24
    },
    //数据库适配, (MagicLinks需要数据库管理Token)
    adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        verificationTokensTable: verificationTokens
    }),
    providers: [
        credentials({
            credentials: {
                email: { label: '邮箱', type: 'email' },
                password: { label: '密码', type: 'password' }
            },
            async authorize(credentials) {
                try {
                    const { email, password } = loginSchema.parse(credentials);
                    const user = await selectUserByEmail(email);

                    if (!user) {
                        throw new Error('用户不存在');
                    }

                    const isPasswordValid = await compare(password, user.password);

                    if (!isPasswordValid) {
                        throw new Error('无效的验证信息');
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name
                    } as User;
                } catch (error) {
                    console.error(error);

                    return null;
                }
            }
        }),
        Resend({
            apiKey: process.env.RESEND_TOKEN,
            from: 'AsMuin <demo@email.asmuin.top>'
        })
    ],
    pages: {
        signIn: '/login'
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
            }

            return session;
        }
    }
});
