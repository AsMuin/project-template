'use client';

import { loginWithEmailSchema } from '@/lib/validations';
import { LoginWithEmail } from '@/db/services/auth';
import AuthForm, { FormItemConfig } from '@/components/AuthForm';

export default function SignInWithEmail() {
    const loginWithEmailConfig: FormItemConfig<Pick<AuthCredentials, 'email'>>[] = [
        {
            key: 'email',
            label: '邮箱',
            type: 'email',
            options: {
                placeholder: '请输入邮箱'
            }
        }
    ];

    return (
        <div>
            <AuthForm type="LOGIN_EMAIL" schema={loginWithEmailSchema} formConfig={loginWithEmailConfig} onSubmit={LoginWithEmail} />
        </div>
    );
}
