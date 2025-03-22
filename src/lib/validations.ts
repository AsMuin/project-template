import { z } from '@/lib/config/i18n';

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, '密码长度不少于8位')
});

export const loginWithEmailSchema = z.object({
    email: z.string().email()
});

export const registerSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8, '密码长度不少于8位')
});

export const userSchema = z.object({
    id: z.string().nonempty(),
    name: z.string().trim().min(2).max(100),
    email: z.string().email(),
    role: z.enum(['ADMIN', 'USER'])
});
