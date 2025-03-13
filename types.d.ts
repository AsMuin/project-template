import type { Request, Response, NextFunction } from 'express';

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
export { UserPayload, ControllerAction, IResponse, RefreshPayload };
