import type { Request, Response, NextFunction } from 'express';
import { InferModel } from 'drizzle-orm';
import users from '@/models/users';
import blackList from '@/models/blackList';

declare global {
    namespace Express {
        interface Request {
            user?: UserPayload; // 可选的用户信息
        }
    }
    interface UserPayload {
        id: string;
        name: string;
        email: string;
        avatarUrl?: string | null;
        roles: string[];
    }

    type IUser = InferModel<typeof users>;
    type IBlackList = InferModel<typeof blackList>;

    type RefreshPayload = Pick<UserPayload, 'id'>;

    interface ControllerAction {
        (req: Request, res: Response, next: NextFunction): void;
    }

    interface IResponse<T = unknown> {
        success: boolean;
        message: string;
        data?: T;
        total?: number;
        page?: number;
        limit?: number;
    }

    interface QueryParams<P = unknown> extends P {
        page: number;
        limit: number;
        signal?: AbortSignal;
    }
}

export {};
