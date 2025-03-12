import type { Request, Response, NextFunction } from 'express';

interface UserPayload {
    id: number;
    email: string;
    avatarUrl: string;
}
interface ControllerAction {
    (req: Request, res: Response, next: NextFunction): void;
}
export { UserPayload, ControllerAction };
