'use client';

import AuthForm, { FormItemConfig } from '@/components/AuthForm';
import { registerSchema } from '@/lib/validations';
import { Register } from '@/db/services/auth';

export default function Registry() {
    const registerFormConfig: FormItemConfig<AuthCredentials>[] = [
        {
            key: 'name',
            label: '姓名',
            options: {
                placeholder: '请输入姓名'
            }
        },
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
            <AuthForm type="REGISTER" schema={registerSchema} formConfig={registerFormConfig} onSubmit={Register} />
        </div>
    );
}
