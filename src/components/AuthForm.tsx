'use client';

import { FieldValues } from 'react-hook-form';
import { z } from 'zod';
import Link from 'next/link';
import { toast } from '@/lib/hooks/useToast';
import { useRouter } from 'next/navigation';
import FlexForm from './FlexForm';
import { ControllerRenderProps, Path } from 'react-hook-form';

type formItemConfigOptions<T extends FieldValues = FieldValues> = Partial<
    ControllerRenderProps<T> & {
        placeholder?: string;
        step: number;
        min: number;
        max: number;
    }
>;
export interface FormItemConfig<T extends FieldValues = FieldValues> {
    key: keyof T;
    label: string;
    type?: 'text' | 'password' | 'email' | 'number' | 'select' | 'date' | 'textarea' | 'checkbox' | 'radio' | 'file' | 'image';
    value?: any;
    description?: string;
    slot?: (filed: ControllerRenderProps<T, Path<T>>, options?: formItemConfigOptions<T>) => React.ReactNode;
    options?: formItemConfigOptions<T>;
}

interface AuthFormProps<T extends FieldValues> {
    type: 'LOGIN' | 'REGISTER' | 'LOGIN_EMAIL';
    schema: z.Schema<T>;
    formConfig: FormItemConfig<T>[];
    onSubmit: (data: T) => Promise<IResponse> | IResponse;
}

export default function AuthForm<T extends FieldValues>({ type, schema, formConfig, onSubmit }: AuthFormProps<T>) {
    const isLogin = type === 'LOGIN' || type === 'LOGIN_EMAIL';
    const router = useRouter();

    async function handleSubmit(data: T) {
        try {
            const result = await onSubmit(data);

            if (result?.success === false) {
                throw new Error(result.message);
            } else if (result?.success === true) {
                toast({
                    title: '成功',
                    description: result.message
                });

                if (type !== 'LOGIN_EMAIL') {
                    router.push('/');
                }
            }
        } catch (error) {
            toast({
                title: '失败',
                description: error instanceof Error ? error.message : isLogin ? '登录失败' : '注册失败',
                variant: 'destructive'
            });
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-semibold text-white">{isLogin ? '欢迎回来' : '注册属于你的账号'}</h1>
            <p className="text-light-100">{isLogin ? '登录你的账号以访问图书信息' : '请填写下述注册信息并提供有效的身份验证信息'}</p>
            <FlexForm
                formInputClass="dark"
                schema={schema}
                formConfig={formConfig}
                onSubmit={handleSubmit}
                button={{ children: isLogin ? '登录' : '注册' }}
                parentClass="space-y-6"
            />
            <p className="text-center text-base font-medium">
                {isLogin ? '创建新账号?' : '已有账号?'}
                <Link className="text-primary font-bold" href={isLogin ? '/register' : '/login'}>
                    {isLogin ? '注册' : '登录'}
                </Link>
            </p>
            {isLogin && (
                <p className="text-center text-base font-medium">
                    <Link className="text-primary font-bold" href={type === 'LOGIN' ? '/loginWithEmail' : '/login'}>
                        {type === 'LOGIN' ? '邮箱验证登录' : '账号密码登录'}
                    </Link>
                </p>
            )}
        </div>
    );
}
