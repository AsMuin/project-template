import { InferModel } from 'drizzle-orm';
import users from '@/db/schema/users';
import { registerSchema } from '@/lib/validations';
import { z } from 'zod';

declare global {
    type IUser = InferModel<typeof users>;
    interface IResponse<T = unknown> {
        success: boolean;
        message: string;
        data?: T;
        total?: number;
        pageIndex?: number;
        limit?: number;
    }
    interface QueryParams<P = unknown> extends P {
        pageIndex: number;
        limit: number;
    }
    type AuthCredentials = z.infer<typeof registerSchema>;
}

export {}