import { z } from '@/lib/i18n';

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, '密码长度不少于8位')
});

export type loginParams = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8, '密码长度不少于8位')
});

export type registerParams = z.infer<typeof registerSchema>;
