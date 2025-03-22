'use server';
import db from '@/lib/config/database';
import responseBody from '../../lib/response';
import { hash } from 'bcryptjs';
import users from '@/db/schema/users';
import { signIn, signOut as onSignOut } from '@/lib/config/auth';
import { selectUserByEmail } from '@/db/services/users';

//注册
async function Register(params: AuthCredentials) {
    try {
        const { name, email, password } = params;

        const existingUser = await selectUserByEmail(email);

        if (existingUser) {
            throw new Error('用户已存在');
        }

        const hashedPassword = await hash(password, 10);

        await db.insert(users).values({
            name,
            email,
            password: hashedPassword
        });

        await LoginWithCredentials({ email, password });

        return responseBody(true, '注册成功');
    } catch (error) {
        return responseBody(false, error instanceof Error ? error.message : '注册失败');
    }
}

//登录验证
async function LoginWithCredentials(credentials: Pick<AuthCredentials, 'email' | 'password'>) {
    try {
        const { email, password } = credentials;
        const result = await signIn('credentials', {
            email,
            password,
            redirect: false
        });

        if (result?.error) {
            throw new Error(result.error);
        }

        return responseBody(true, '登录成功');
    } catch (error) {
        return responseBody(false, error instanceof Error ? error.message : '登录失败');
    }
}

//邮箱授权链接登录
async function LoginWithEmail(credentials: Pick<AuthCredentials, 'email'>) {
    try {
        const isExist = await selectUserByEmail(credentials.email);

        if (!isExist) {
            throw new Error('用户不存在');
        }

        return signIn('resend', credentials);
    } catch (error) {
        return responseBody(false, error instanceof Error ? error.message : '发送失败');
    }
}

//登出
async function signOut() {
    await onSignOut();
}

export { Register, LoginWithCredentials, signOut, LoginWithEmail };
