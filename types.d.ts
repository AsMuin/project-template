import type { Request, Response, NextFunction } from 'express';
import { InferModel } from 'drizzle-orm';
import users from '@/db/schema/users';
import blackList from '@/db/schema/blackList';

declare global {
    namespace Express {
        interface Request {
            user?: UserPayload; // 可选的用户信息
        }
    }
}
interface UserPayload {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
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
    pageIndex?: number;
    limit?: number;
}

interface QueryParams<P = unknown> extends P {
    pageIndex: number;
    limit: number;
    signal?: AbortSignal;
}

export { UserPayload, ControllerAction, IResponse, RefreshPayload, QueryParams, IBlackList, IUser };
