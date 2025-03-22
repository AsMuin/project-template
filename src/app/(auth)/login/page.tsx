'use client';

import AuthForm, { FormItemConfig } from '@/components/AuthForm';
import { loginSchema } from '@/lib/validations';
import { LoginWithCredentials } from '@/db/services/auth';

export default function SignIn() {
    const loginFormConfig: FormItemConfig<Pick<AuthCredentials, 'email' | 'password'>>[] = [
        {
            key: 'email',
            label: '邮箱',
            type: 'email',
            options: {
                placeholder: '请输入邮箱'
            }
        },
        {
            key: 'password',
            label: '密码',
            type: 'password',
            options: {
                placeholder: '请输入密码'
            }
        }
    ];

    return (
        <div>
            <AuthForm type="LOGIN" schema={loginSchema} formConfig={loginFormConfig} onSubmit={LoginWithCredentials} />
        </div>
    );
}
