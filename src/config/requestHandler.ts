import { Request, Response, NextFunction } from 'express';

function RequestHandler(handlerCallBack: (req: Request, res: Response, next: NextFunction) => Promise<any> | any) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await handlerCallBack(req, res, next);
        } catch (error) {
            next(error);
        }
    };
}

export default RequestHandler;
